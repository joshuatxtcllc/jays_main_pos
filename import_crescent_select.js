/**
 * Import Crescent Select Matboards
 * 
 * This script imports the Crescent Select matboard data directly from 
 * the specification chart into the database for use in the POS system.
 * 
 * Each matboard includes the proper product code, name, and a close approximation
 * of the actual color based on the reference chart.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Postgres client for direct database access if needed
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Crescent Select mat data from the specification chart
const crescentSelectMats = [
  // First row
  { id: "crescent-9810", name: "Tawny", code: "9810", alt_code: "89810", color: "#D9CEB1", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9512", name: "Mummy", code: "9512", color: "#E7D9BA", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9514", name: "Toasty", code: "9514", color: "#CCB88F", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9811", name: "Putty", code: "9811", alt_code: "89811", color: "#C2BAA3", category: "Neutrals", manufacturer: "Crescent" },
  { id: "crescent-9861", name: "York", code: "9861", alt_code: "89861", color: "#C5B899", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9589", name: "Bambi", code: "9589", color: "#B39A85", category: "Earth Tones", manufacturer: "Crescent" },
  
  // Second row
  { id: "crescent-9817", name: "Green Mist", code: "9817", alt_code: "89817", color: "#B2AE8A", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9528", name: "Lama", code: "9528", color: "#B3A784", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9529", name: "Silly Putty", code: "9529", color: "#B8AC91", category: "Neutrals", manufacturer: "Crescent" },
  { id: "crescent-9530", name: "Hedge Hog", code: "9530", color: "#A39885", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9818", name: "Sienna", code: "9818", alt_code: "89818", color: "#A09178", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9826", name: "Mocha Green", code: "9826", alt_code: "89826", color: "#968C74", category: "Earth Tones", manufacturer: "Crescent" },
  
  // Third row
  { id: "crescent-9829", name: "Rhino", code: "9829", alt_code: "89829", color: "#A0A997", category: "Neutrals", manufacturer: "Crescent" },
  { id: "crescent-9903", name: "Underbrush", code: "9903", color: "#7E7A64", category: "Earth Tones", manufacturer: "Crescent" },
  { id: "crescent-9822", name: "Sierra Olive", code: "9822", alt_code: "89822", color: "#686F51", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9532", name: "Olive Branch", code: "9532", color: "#656A55", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9526", name: "Pickle", code: "9526", color: "#ABAD6A", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9602", name: "Guacamole", code: "9602", color: "#C2C889", category: "Greens", manufacturer: "Crescent" },
  
  // Fourth row (half-width mats)
  { id: "crescent-9525", name: "Sage Advice", code: "9525", color: "#B8B99B", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9920", name: "Lizard", code: "9920", alt_code: "89920", color: "#8A9379", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9827", name: "Wise Green", code: "9827", alt_code: "89827", color: "#899176", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9819", name: "Moss Green", code: "9819", alt_code: "89819", color: "#7E8665", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9621", name: "Bud", code: "9621", color: "#A4BD88", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9531", name: "Spinach", code: "9531", color: "#99B47D", category: "Greens", manufacturer: "Crescent" },
  
  // Fifth row
  { id: "crescent-9820", name: "Forest Green", code: "9820", alt_code: "89820", color: "#5F7160", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9537", name: "Envy", code: "9537", color: "#5D7360", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9534", name: "Martian", code: "9534", alt_code: "89534", color: "#8AADA6", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9535", name: "Turf", code: "9535", color: "#7D9D8B", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9872", name: "Irish Green", code: "9872", color: "#6AAD91", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9890", name: "Lawn", code: "9890", color: "#52A075", category: "Greens", manufacturer: "Crescent" },
  
  // Sixth row
  { id: "crescent-9904", name: "Blarney", code: "9904", color: "#5F8076", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9821", name: "Ivy Green", code: "9821", alt_code: "89821", color: "#55746A", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9833", name: "Bonsai", code: "9833", alt_code: "89833", color: "#3E604F", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9838", name: "Deep Woods", code: "9838", alt_code: "89838", color: "#375D4E", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9877", name: "Midnight Green", code: "9877", alt_code: "89877", color: "#295C4A", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9823", name: "Black Forest", code: "9823", alt_code: "89823", color: "#2A4A3F", category: "Greens", manufacturer: "Crescent" },
  
  // Seventh row
  { id: "crescent-9536", name: "Pond", code: "9536", color: "#9CBDAF", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9539", name: "Riptide", code: "9539", color: "#8FD4D2", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9540", name: "Pool Liner", code: "9540", color: "#7ABFBF", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9624", name: "Scuba", code: "9624", color: "#588D91", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9881", name: "Real Teal", code: "9881", alt_code: "89881", color: "#307A7F", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9891", name: "Teal Teal", code: "9891", color: "#225F6F", category: "Blues", manufacturer: "Crescent" },
  
  // Eighth row
  { id: "crescent-9805", name: "Tealy Dan", code: "9805", color: "#115D6B", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9878", name: "Aqua Green", code: "9878", color: "#0F7581", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9541", name: "Kentucky Pasture", code: "9541", color: "#4D9BA2", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9623", name: "Greenery", code: "9623", color: "#4D7A73", category: "Greens", manufacturer: "Crescent" },
  { id: "crescent-9546", name: "Blue Satin", code: "9546", color: "#DDE1E5", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9882", name: "Cornflower", code: "9882", color: "#ABC6DC", category: "Blues", manufacturer: "Crescent" },
  
  // Ninth row
  { id: "crescent-9550", name: "Cabana", code: "9550", color: "#459BCA", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9888", name: "Electric Blue", code: "9888", color: "#4795C3", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9897", name: "Water Fall", code: "9897", color: "#3D7FB2", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9551", name: "Blue Wave", code: "9551", color: "#3C74AF", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9607", name: "Blue Chip", code: "9607", color: "#5071AC", category: "Blues", manufacturer: "Crescent" },
  { id: "crescent-9827", name: "Flag Blue", code: "9827", alt_code: "89827", color: "#5B72AD", category: "Blues", manufacturer: "Crescent" }
];

/**
 * Checks if mat_colors table exists, creates it if it doesn't
 */
async function ensureMatColorsTableExists() {
  try {
    const { data, error } = await supabase
      .from('mat_colors')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking mat_colors table:', error);
      
      // If table doesn't exist, create it using PostgreSQL
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS mat_colors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            price NUMERIC NOT NULL,
            manufacturer TEXT,
            code TEXT,
            description TEXT,
            category TEXT
          )
        `);
        console.log('Created mat_colors table');
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error('Error ensuring mat_colors table exists:', error);
    throw error;
  }
}

/**
 * Imports the Crescent Select matboards to the mat_colors table
 */
async function importCrescentSelectMats() {
  try {
    console.log('Starting import of Crescent Select matboards...');
    
    // Make sure the table exists
    await ensureMatColorsTableExists();
    
    // Get existing mat colors to avoid duplicates
    const { data: existingMatColors, error: fetchError } = await supabase
      .from('mat_colors')
      .select('id');
    
    if (fetchError) {
      console.error('Error fetching existing mat colors:', fetchError);
      throw fetchError;
    }
    
    // Create a set of existing IDs for quick lookup
    const existingIds = new Set(existingMatColors.map(mc => mc.id));
    console.log(`Found ${existingIds.size} existing mat colors`);
    
    // Add standard wholesale price for these mats if not present
    // Using a default price per square inch for all mats
    const DEFAULT_PRICE_PER_SQIN = 0.000029;
    
    // Filter out mats that already exist
    const newMats = crescentSelectMats.filter(mat => !existingIds.has(mat.id));
    console.log(`Found ${newMats.length} new Crescent Select mats to import`);
    
    // Add price to each mat
    const matsToInsert = newMats.map(mat => ({
      ...mat,
      price: DEFAULT_PRICE_PER_SQIN,
      description: mat.description || `${mat.name} - Crescent Select matboard`
    }));
    
    if (matsToInsert.length === 0) {
      console.log('No new mats to insert');
      return { message: 'No new mats to insert' };
    }
    
    // Insert the new mats
    const { data: insertedMats, error: insertError } = await supabase
      .from('mat_colors')
      .insert(matsToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting Crescent Select mats:', insertError);
      throw insertError;
    }
    
    console.log(`Successfully imported ${insertedMats.length} Crescent Select mats`);
    return {
      message: `Successfully imported ${insertedMats.length} Crescent Select mats`,
      importedMats: insertedMats
    };
  } catch (error) {
    console.error('Error importing Crescent Select mats:', error);
    throw error;
  }
}

// Run the import if called directly
if (require.main === module) {
  importCrescentSelectMats()
    .then(result => {
      console.log('Import result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importCrescentSelectMats };