/**
 * Seed Larson Juhl Catalog
 * 
 * This script creates a set of sample Crescent matboard entries
 * and inserts them directly into the database.
 */

import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample catalog data for Crescent matboards
// This represents a realistic subset of what would be extracted from the catalog
const crescentMatboards = [
  // Whites
  {
    id: 'crescent-C100',
    name: 'Bright White',
    hex_color: '#FFFFFF',
    price: 0.000025, // per square inch (wholesale)
    code: 'C100',
    crescent_code: 'C100',
    description: 'Bright white conservation mat board',
    category: 'Whites',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C101',
    name: 'Cream',
    hex_color: '#FFF8E1',
    price: 0.000025, // per square inch (wholesale)
    code: 'C101',
    crescent_code: 'C101',
    description: 'Cream white conservation mat board',
    category: 'Whites',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C102',
    name: 'Antique White',
    hex_color: '#F5F1E6',
    price: 0.000025, // per square inch (wholesale)
    code: 'C102',
    crescent_code: 'C102',
    description: 'Subtle antique white tone',
    category: 'Whites',
    manufacturer: 'Crescent'
  },
  // Neutrals
  {
    id: 'crescent-C200',
    name: 'Stone',
    hex_color: '#E0DCCC',
    price: 0.000027, // per square inch (wholesale)
    code: 'C200',
    crescent_code: 'C200',
    description: 'Light stone grey conservation mat',
    category: 'Neutrals',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C201',
    name: 'Fog',
    hex_color: '#D6D6D6',
    price: 0.000027, // per square inch (wholesale)
    code: 'C201',
    crescent_code: 'C201',
    description: 'Subtle fog grey conservation mat',
    category: 'Neutrals',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C202',
    name: 'Granite',
    hex_color: '#A9A9A9',
    price: 0.000027, // per square inch (wholesale)
    code: 'C202',
    crescent_code: 'C202',
    description: 'Darker granite grey tone',
    category: 'Neutrals',
    manufacturer: 'Crescent'
  },
  // Blues
  {
    id: 'crescent-C300',
    name: 'Colonial Blue',
    hex_color: '#B5C7D3',
    price: 0.000029, // per square inch (wholesale)
    code: 'C300',
    crescent_code: 'C300',
    description: 'Subtle colonial blue conservation mat',
    category: 'Blues',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C301',
    name: 'Wedgewood',
    hex_color: '#6E99C0',
    price: 0.000029, // per square inch (wholesale)
    code: 'C301',
    crescent_code: 'C301',
    description: 'Classic wedgewood blue conservation mat',
    category: 'Blues',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C302',
    name: 'Ultramarine',
    hex_color: '#4166B0',
    price: 0.000029, // per square inch (wholesale)
    code: 'C302',
    crescent_code: 'C302',
    description: 'Deep ultramarine blue conservation mat',
    category: 'Blues',
    manufacturer: 'Crescent'
  },
  // Greens
  {
    id: 'crescent-C400',
    name: 'Sage',
    hex_color: '#BCCCBA',
    price: 0.000029, // per square inch (wholesale)
    code: 'C400',
    crescent_code: 'C400',
    description: 'Soft sage green conservation mat',
    category: 'Greens',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C401',
    name: 'Celadon',
    hex_color: '#9CB084',
    price: 0.000029, // per square inch (wholesale)
    code: 'C401',
    crescent_code: 'C401',
    description: 'Classic celadon green conservation mat',
    category: 'Greens',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C402',
    name: 'Forest',
    hex_color: '#4A6741',
    price: 0.000029, // per square inch (wholesale)
    code: 'C402',
    crescent_code: 'C402',
    description: 'Deep forest green conservation mat',
    category: 'Greens',
    manufacturer: 'Crescent'
  },
  // Earth Tones
  {
    id: 'crescent-C500',
    name: 'Sand',
    hex_color: '#E6D7B8',
    price: 0.000027, // per square inch (wholesale)
    code: 'C500',
    crescent_code: 'C500',
    description: 'Light sand beige conservation mat',
    category: 'Earth Tones',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C501',
    name: 'Chamois',
    hex_color: '#D9BC8C',
    price: 0.000027, // per square inch (wholesale)
    code: 'C501',
    crescent_code: 'C501',
    description: 'Warm chamois tan conservation mat',
    category: 'Earth Tones',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C502',
    name: 'Chestnut',
    hex_color: '#A67B5B',
    price: 0.000027, // per square inch (wholesale)
    code: 'C502',
    crescent_code: 'C502',
    description: 'Rich chestnut brown conservation mat',
    category: 'Earth Tones',
    manufacturer: 'Crescent'
  },
  // Warm Tones
  {
    id: 'crescent-C600',
    name: 'Pale Rose',
    hex_color: '#F0D4D4',
    price: 0.000029, // per square inch (wholesale)
    code: 'C600',
    crescent_code: 'C600',
    description: 'Subtle pale rose conservation mat',
    category: 'Warm Tones',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C601',
    name: 'Dusty Rose',
    hex_color: '#D4A9A9',
    price: 0.000029, // per square inch (wholesale)
    code: 'C601',
    crescent_code: 'C601',
    description: 'Classic dusty rose conservation mat',
    category: 'Warm Tones',
    manufacturer: 'Crescent'
  },
  {
    id: 'crescent-C602',
    name: 'Rust',
    hex_color: '#B56A55',
    price: 0.000029, // per square inch (wholesale)
    code: 'C602',
    crescent_code: 'C602',
    description: 'Deep rust red conservation mat',
    category: 'Warm Tones',
    manufacturer: 'Crescent'
  },
  // Black
  {
    id: 'crescent-C700',
    name: 'Raven Black',
    hex_color: '#1A1A1A',
    price: 0.00003, // per square inch (wholesale)
    code: 'C700',
    crescent_code: 'C700',
    description: 'Deep black conservation mat board',
    category: 'Black',
    manufacturer: 'Crescent'
  }
];

/**
 * Inserts sample Crescent matboards directly into the database
 */
async function seedDatabase() {
  console.log('Seeding database with Crescent matboard samples...');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    return;
  }
  
  try {
    // Prepare SQL insert statement
    const valueStrings = crescentMatboards.map(mat => {
      return `('${mat.id}', '${mat.name}', '${mat.hex_color}', ${mat.price}, '${mat.code}', '${mat.crescent_code}', '${mat.description}', '${mat.category}', '${mat.manufacturer}')`;
    });
    
    // Create SQL file
    const sqlContent = `
    -- This is an auto-generated SQL file for seeding the larson_juhl_catalog table
    INSERT INTO larson_juhl_catalog (id, name, hex_color, price, code, crescent_code, description, category, manufacturer)
    VALUES 
    ${valueStrings.join(',\n    ')}
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      hex_color = EXCLUDED.hex_color,
      price = EXCLUDED.price,
      code = EXCLUDED.code,
      crescent_code = EXCLUDED.crescent_code,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      manufacturer = EXCLUDED.manufacturer;
    `;
    
    // Write SQL to temp file
    const sqlFilePath = path.join(__dirname, 'seed_catalog.sql');
    fs.writeFileSync(sqlFilePath, sqlContent);
    
    // Execute SQL
    console.log('Executing SQL to insert sample data...');
    execSync(`psql "${process.env.DATABASE_URL}" -f ${sqlFilePath}`, { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    // Clean up temp file
    fs.unlinkSync(sqlFilePath);
    
    console.log(`Successfully seeded database with ${crescentMatboards.length} Crescent matboard samples.`);
    
    // Also output the data as JSON for reference
    const jsonFilePath = path.join(__dirname, 'crescent_matboards.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(crescentMatboards, null, 2));
    console.log(`Saved matboard data to ${jsonFilePath} for reference.`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeder
seedDatabase().catch(error => {
  console.error('Unhandled error:', error);
});