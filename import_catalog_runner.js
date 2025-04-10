/**
 * Import Catalog Runner
 * 
 * This script orchestrates the entire process of:
 * 1. Parsing the Larson-Juhl PDF catalog
 * 2. Extracting matboard data
 * 3. Importing the data to the Supabase database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
 * Runs a script and returns its output
 * @param {string} scriptPath Path to the script to run
 * @param {boolean} logOutput Whether to log the output of the script
 * @returns {string} The script's output
 */
function runScript(scriptPath, logOutput = true) {
  console.log(`${colors.bright}${colors.cyan}Running: ${scriptPath}${colors.reset}`);
  console.log(`${colors.dim}------------------------------------------------------${colors.reset}`);
  
  try {
    // Execute the script and capture its output
    const output = execSync(`node ${scriptPath}`, { 
      encoding: 'utf8',
      stdio: logOutput ? 'inherit' : 'pipe'  // Use 'inherit' to show real-time output
    });
    
    console.log(`${colors.green}✓ Successfully executed ${scriptPath}${colors.reset}`);
    console.log(`${colors.dim}------------------------------------------------------${colors.reset}\n`);
    
    return output;
  } catch (error) {
    console.error(`${colors.red}✗ Error executing ${scriptPath}:${colors.reset}`);
    console.error(error.message);
    console.log(`${colors.dim}------------------------------------------------------${colors.reset}\n`);
    return null;
  }
}

/**
 * Checks if required environment variables are set
 * @returns {boolean} Whether all required variables are set
 */
function checkEnvironmentVariables() {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_KEY'];
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
 * @returns {boolean} Whether the table exists
 */
function checkOrCreateTable() {
  try {
    console.log(`${colors.cyan}Checking if larson_juhl_catalog table exists...${colors.reset}`);
    
    // Execute the SQL script to create the table if it doesn't exist
    const sqlScript = path.join(__dirname, 'setup_larson_catalog.sql');
    
    if (!fs.existsSync(sqlScript)) {
      console.error(`${colors.red}SQL script not found: ${sqlScript}${colors.reset}`);
      return false;
    }
    
    // This will create the table if it doesn't exist (using IF NOT EXISTS)
    execSync(`psql "${process.env.DATABASE_URL}" -f ${sqlScript}`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log(`${colors.green}✓ Table created/verified${colors.reset}\n`);
    return true;
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
  if (!checkOrCreateTable()) {
    return;
  }
  
  // Step 1: Parse the PDF file
  console.log(`${colors.bright}${colors.blue}STEP 1: Parsing PDF Catalog${colors.reset}`);
  const pdfParseResult = runScript('parse_larson_catalog.js');
  
  if (!pdfParseResult) {
    console.error(`${colors.red}PDF parsing failed. Cannot continue.${colors.reset}`);
    return;
  }
  
  // Step 2: Extract matboard data
  console.log(`${colors.bright}${colors.blue}STEP 2: Extracting Matboard Data${colors.reset}`);
  runScript('extract_matboard_data.js');
  
  // Check if extraction created a JSON file
  const jsonPath = path.join(__dirname, 'extracted_matboards.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`${colors.red}Extraction failed - no JSON file created at ${jsonPath}${colors.reset}`);
    return;
  }
  
  // Step 3: Ask user if they want to import the data to Supabase
  console.log(`${colors.bright}${colors.blue}STEP 3: Import to Supabase${colors.reset}`);
  
  // Read the number of matboards extracted
  let matboardCount = 0;
  try {
    const extractedData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    matboardCount = extractedData.length;
  } catch (error) {
    console.error(`${colors.red}Error reading extracted matboards JSON:${colors.reset}`, error.message);
  }
  
  if (matboardCount === 0) {
    console.log(`${colors.yellow}No matboards were extracted. Skipping import.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.green}Found ${matboardCount} matboards to import.${colors.reset}`);
  console.log(`\n${colors.yellow}To import this data to Supabase:${colors.reset}`);
  console.log(`1. Open extract_matboard_data.js`);
  console.log(`2. Uncomment the importToSupabase(matboardData) line at the end of the file`);
  console.log(`3. Run node extract_matboard_data.js\n`);
  
  console.log(`${colors.bright}${colors.green}Import process completed!${colors.reset}`);
}

// Run the import process
runImportProcess().catch(error => {
  console.error(`${colors.red}Unhandled error in import process:${colors.reset}`, error);
});