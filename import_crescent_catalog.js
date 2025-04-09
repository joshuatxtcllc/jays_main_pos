
// Import Crescent Matboard data to Supabase
// Run with: node import_crescent_catalog.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials if needed
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// This is where you'll paste your Crescent catalog data
// Format: Array of matboard objects with the following fields:
// - id: A unique identifier (can be 'crescent-' + code)
// - name: The display name of the matboard
// - hex_color: The color in hex format (e.g., '#FFFFFF')
// - price: The wholesale price per square inch
// - code: The Crescent code (e.g., 'S100')
// - crescent_code: Same as code, but can be used if you need to differentiate
// - description: A description of the matboard
// - category: The category (e.g., 'Whites', 'Blues', etc.)
// - manufacturer: Should be 'Crescent'
const crescentMatboards = [
  // PASTE YOUR CRESCENT CATALOG DATA HERE
  // Example:
  // {
  //   id: 'crescent-S100',
  //   name: 'Bright White',
  //   hex_color: '#FFFFFF',
  //   price: 0.025,
  //   code: 'S100',
  //   crescent_code: 'S100',
  //   description: 'Bright white conservation mat board',
  //   category: 'Whites',
  //   manufacturer: 'Crescent'
  // },
  // ... add more matboards
];

// Function to import the Crescent matboard data to Supabase
async function importCrescentMatboards() {
  try {
    console.log('Creating larson_juhl_catalog table if it doesn\'t exist...');
    
    // Create the table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_larson_juhl_catalog_table');
    
    if (createError) {
      console.error('Error creating table:', createError);
      
      // Try direct SQL query as fallback
      const { error: directCreateError } = await supabase
        .from('_exec_sql')
        .select('*')
        .eq('query', `
          CREATE TABLE IF NOT EXISTS larson_juhl_catalog (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            hex_color TEXT NOT NULL,
            price DECIMAL(10,4) NOT NULL,
            code TEXT NOT NULL,
            crescent_code TEXT,
            description TEXT,
            category TEXT,
            manufacturer TEXT NOT NULL
          );
        `);
      
      if (directCreateError) {
        console.error('Error with direct SQL creation:', directCreateError);
        console.log('You may need to create the table manually in the Supabase console.');
      }
    }
    
    // Check if we have matboards to import
    if (crescentMatboards.length === 0) {
      console.error('No matboards defined in the crescentMatboards array. Please add your catalog data.');
      return;
    }
    
    console.log(`Importing ${crescentMatboards.length} Crescent matboards to Supabase...`);
    
    // Insert the matboards in batches of 50 to avoid payload size limits
    const batchSize = 50;
    for (let i = 0; i < crescentMatboards.length; i += batchSize) {
      const batch = crescentMatboards.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('larson_juhl_catalog')
        .upsert(batch, { onConflict: 'id' });
      
      if (insertError) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, insertError);
      } else {
        console.log(`Successfully imported batch ${i / batchSize + 1} of ${Math.ceil(crescentMatboards.length / batchSize)}`);
      }
    }
    
    console.log('Import completed!');
  } catch (error) {
    console.error('Error during import process:', error);
  }
}

// Run the import function
importCrescentMatboards();
