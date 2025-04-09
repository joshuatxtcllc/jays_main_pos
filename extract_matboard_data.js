
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the text file created by parse_larson_catalog.js
const catalogText = fs.readFileSync('larson_catalog_text.txt', 'utf-8');

// Function to extract matboard data using regex patterns
function extractMatboardData() {
  console.log('Extracting matboard data from catalog text...');
  
  // This is a placeholder - you'll need to create patterns that match your specific PDF layout
  // Example pattern - this will likely need customization based on the actual PDF structure
  const matboardPattern = /([A-Z]\d{3})\s+([A-Za-z\s]+)\s+(\$\d+\.\d{2})/g;
  
  const matboards = [];
  let match;
  
  while ((match = matboardPattern.exec(catalogText)) !== null) {
    const code = match[1];
    const name = match[2].trim();
    const priceStr = match[3].replace('$', '');
    const price = parseFloat(priceStr);
    
    // Convert price per sheet to price per square inch
    // Assuming standard 32x40 inch sheets (1280 sq inches)
    const pricePerSquareInch = (price / 1280).toFixed(4);
    
    matboards.push({
      id: `crescent-${code}`,
      name: name,
      // Note: This doesn't extract hex color - you would need a mapping for that
      hex_color: '#FFFFFF', // Placeholder
      price: pricePerSquareInch,
      code: code,
      crescent_code: code,
      description: `${name} conservation mat board`,
      category: 'Unknown', // You would need to extract or map this
      manufacturer: 'Crescent'
    });
  }
  
  console.log(`Extracted ${matboards.length} matboards from the catalog`);
  
  // Save to a JSON file for review
  fs.writeFileSync('extracted_matboards.json', JSON.stringify(matboards, null, 2));
  console.log('Saved matboard data to extracted_matboards.json');
  
  return matboards;
}

// Function to import the extracted data to Supabase
async function importToSupabase(matboards) {
  if (matboards.length === 0) {
    console.log('No matboard data to import');
    return;
  }
  
  console.log(`Importing ${matboards.length} matboards to Supabase...`);
  
  try {
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < matboards.length; i += batchSize) {
      const batch = matboards.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('larson_juhl_catalog')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Successfully imported batch ${i / batchSize + 1} of ${Math.ceil(matboards.length / batchSize)}`);
      }
    }
    
    console.log('Import completed!');
  } catch (error) {
    console.error('Error during import process:', error);
  }
}

// Run the extraction and import process
const matboardData = extractMatboardData();

// Uncomment the following line when you're ready to import to Supabase
// importToSupabase(matboardData);
