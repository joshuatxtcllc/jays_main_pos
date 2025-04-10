/**
 * Import Catalog Runner
 * 
 * This script orchestrates the entire process of:
 * 1. Parsing the Larson-Juhl PDF catalog
 * 2. Extracting matboard data
 * 3. Importing the data to the Supabase database
 */

import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { parsePdfCatalog } from './parse_larson_catalog.js';
import { extractMatboardData, importToSupabase } from './extract_matboard_data.js';

dotenv.config();

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Runs a SQL query using psql
 * @param {string} sql The SQL query to run
 * @returns {Promise<boolean>} Whether the query was successful
 */
async function runSqlQuery(sql) {
  try {
    console.log(`${colors.cyan}Running SQL query...${colors.reset}`);
    const sqlFile = path.join(__dirname, 'temp_query.sql');
    fs.writeFileSync(sqlFile, sql);
    
    execSync(`psql "${process.env.DATABASE_URL}" -f ${sqlFile}`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    // Clean up temp file
    fs.unlinkSync(sqlFile);
    
    console.log(`${colors.green}✓ SQL query executed successfully${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error executing SQL query:${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Checks if required environment variables are set
 * @returns {boolean} Whether all required variables are set
 */
function checkEnvironmentVariables() {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_KEY', 'DATABASE_URL'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error(`${colors.red}The following environment variables are missing:${colors.reset}`);
    missingVars.forEach(v => console.error(`  - ${v}`));
    console.error(`\n${colors.yellow}Please set these variables in your .env file or environment.${colors.reset}`);
    return false;
  }
  
  return true;
}

/**
 * Checks if the required SQL table exists
 * @returns {Promise<boolean>} Whether the table exists
 */
async function checkOrCreateTable() {
  try {
    console.log(`${colors.cyan}Checking if larson_juhl_catalog table exists...${colors.reset}`);
    
    const createTableSQL = `
    DROP TABLE IF EXISTS larson_juhl_catalog;
    CREATE TABLE larson_juhl_catalog (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hex_color TEXT NOT NULL,
      price DECIMAL(10,6) NOT NULL,
      code TEXT NOT NULL,
      crescent_code TEXT,
      description TEXT,
      category TEXT,
      manufacturer TEXT NOT NULL
    );`;
    
    const success = await runSqlQuery(createTableSQL);
    
    if (success) {
      console.log(`${colors.green}✓ Table created/verified${colors.reset}\n`);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}Error creating/checking table:${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Main function to run the entire import process
 */
async function runImportProcess() {
  console.log(`${colors.bright}${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}   Larson-Juhl Catalog Import Process   ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}========================================${colors.reset}\n`);
  
  // First, check environment variables
  if (!checkEnvironmentVariables()) {
    return;
  }
  
  // Check/create the database table
  if (!await checkOrCreateTable()) {
    return;
  }
  
  // Step 1: Parse the PDF file
  console.log(`${colors.bright}${colors.blue}STEP 1: Parsing PDF Catalog${colors.reset}`);
  const pdfText = await parsePdfCatalog();
  
  if (!pdfText) {
    console.error(`${colors.red}PDF parsing failed. Cannot continue.${colors.reset}`);
    return;
  }
  
  // Step 2: Extract matboard data
  console.log(`${colors.bright}${colors.blue}STEP 2: Extracting Matboard Data${colors.reset}`);
  const matboardData = extractMatboardData();
  
  // Check if extraction created matboards
  if (matboardData.length === 0) {
    console.error(`${colors.red}Extraction found no matboards. Cannot continue.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.green}Found ${matboardData.length} matboards to import.${colors.reset}`);
  
  // Step 3: Import data to Supabase
  console.log(`${colors.bright}${colors.blue}STEP 3: Import to Database${colors.reset}`);
  
  const importChoice = process.argv.includes('--import') ? 'y' : 'n';
  
  if (importChoice.toLowerCase() === 'y') {
    console.log(`${colors.cyan}Importing matboard data...${colors.reset}`);
    
    // Import to Supabase
    await importToSupabase(matboardData);
    
    // Also import directly to PostgreSQL for fallback
    try {
      console.log(`${colors.cyan}Importing data directly to PostgreSQL...${colors.reset}`);
      
      // Prepare data for SQL insert
      const valueStrings = matboardData.map(mat => {
        return `('${mat.id.replace(/'/g, "''")}', 
                '${mat.name.replace(/'/g, "''")}', 
                '${mat.hex_color.replace(/'/g, "''")}', 
                ${mat.price}, 
                '${mat.code.replace(/'/g, "''")}', 
                '${(mat.crescent_code || '').replace(/'/g, "''")}', 
                '${(mat.description || '').replace(/'/g, "''")}', 
                '${(mat.category || '').replace(/'/g, "''")}', 
                '${mat.manufacturer.replace(/'/g, "''")}')`
      });
      
      // Create batches of 100 rows
      const batchSize = 100;
      for (let i = 0; i < valueStrings.length; i += batchSize) {
        const batch = valueStrings.slice(i, i + batchSize);
        const insertSQL = `
        INSERT INTO larson_juhl_catalog (id, name, hex_color, price, code, crescent_code, description, category, manufacturer)
        VALUES ${batch.join(',\n')}
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          hex_color = EXCLUDED.hex_color,
          price = EXCLUDED.price,
          code = EXCLUDED.code,
          crescent_code = EXCLUDED.crescent_code,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          manufacturer = EXCLUDED.manufacturer;`;
        
        const success = await runSqlQuery(insertSQL);
        if (success) {
          console.log(`${colors.green}✓ Imported batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(valueStrings.length/batchSize)}${colors.reset}`);
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error during direct PostgreSQL import:${colors.reset}`, error);
    }
  } else {
    console.log(`${colors.yellow}Skipping import. Run with --import flag to import data.${colors.reset}`);
  }
  
  console.log(`${colors.bright}${colors.green}Import process completed!${colors.reset}`);
}

// Run the import process
runImportProcess().catch(error => {
  console.error(`${colors.red}Unhandled error in import process:${colors.reset}`, error);
});