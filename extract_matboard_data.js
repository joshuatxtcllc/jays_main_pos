
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

// Color mapping for common mat colors
const colorMappings = {
  // Whites
  'white': '#FFFFFF',
  'cream': '#FFF8DC',
  'ivory': '#FFFFF0',
  'antique': '#FAEBD7',
  // Earth tones
  'tan': '#D2B48C',
  'brown': '#A52A2A',
  'beige': '#F5F5DC',
  // Grays
  'gray': '#808080',
  'grey': '#808080',
  'charcoal': '#36454F',
  // Blues
  'blue': '#4682B4',
  'navy': '#000080',
  // Reds
  'red': '#B22222',
  'burgundy': '#800020',
  // Greens
  'green': '#2E8B57',
  'olive': '#808000',
  // Other
  'black': '#000000'
};

/**
 * Determines the most likely hex color based on the mat name
 * @param {string} name The matboard name
 * @returns {string} A hex color code
 */
function determineColorFromName(name) {
  name = name.toLowerCase();
  
  // Check for exact color keywords in the name
  for (const [colorName, hexValue] of Object.entries(colorMappings)) {
    if (name.includes(colorName)) {
      return hexValue;
    }
  }
  
  // Default light cream color if no match is found
  return '#FFFFF0';
}

/**
 * Determines the category based on the mat name or description
 * @param {string} name The matboard name
 * @returns {string} The category
 */
function determineCategory(name) {
  name = name.toLowerCase();
  
  if (name.includes('conservation') || name.includes('archival')) {
    return 'Conservation';
  } else if (name.includes('suede') || name.includes('texture')) {
    return 'Textured';
  } else if (name.includes('metallic') || name.includes('gold') || name.includes('silver')) {
    return 'Metallic';
  } else if (name.includes('core') || name.includes('double')) {
    return 'Double Mat';
  }
  
  return 'Standard';
}

/**
 * Extracts matboard data from the Larson-Juhl catalog text
 */
function extractMatboardData() {
  // Path to the text file created by parse_larson_catalog.js
  const textFilePath = path.join(__dirname, 'larson_catalog_text.txt');
  
  console.log(`Reading catalog text from: ${textFilePath}`);
  
  if (!fs.existsSync(textFilePath)) {
    console.error(`File not found: ${textFilePath}`);
    console.log('Please run parse_larson_catalog.js first to generate the text file.');
    return [];
  }
  
  try {
    const catalogText = fs.readFileSync(textFilePath, 'utf-8');
    console.log(`Successfully read catalog text (${catalogText.length} characters)`);
    
    console.log('Extracting matboard data using pattern matching...');
    
    // This regex looks for a code (letter followed by 3 digits), 
    // then a name (alphanumeric with spaces), then a price (dollar amount)
    // Adjust based on the actual format in your PDF
    const matboardPattern = /([A-Z]\d{3})\s+([A-Za-z0-9\s\-]+?)(?:\s{2,}|\t)(\$\d+\.\d{2})/g;
    
    // Alternative pattern that might work better depending on PDF structure
    const alternativePattern = /([A-Z]\d{3})[^\n]*?([A-Za-z0-9\s\-]+?)(?:\s{2,}|\t)(\$\d+\.\d{2})/g;
    
    const matboards = [];
    let match;
    const usedPattern = matboardPattern;
    
    while ((match = usedPattern.exec(catalogText)) !== null) {
      try {
        const code = match[1];
        const rawName = match[2].replace(/\s+/g, ' ').trim();
        const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        const priceStr = match[3].replace('$', '');
        const price = parseFloat(priceStr);
        
        if (isNaN(price)) {
          console.warn(`Skipping entry with invalid price: ${match[0]}`);
          continue;
        }
        
        // Convert price per sheet to price per square inch
        // Assuming standard 32x40 inch sheets (1280 sq inches)
        const pricePerSquareInch = (price / 1280).toFixed(6);
        
        // Determine color and category based on the name
        const hexColor = determineColorFromName(name);
        const category = determineCategory(name);
        
        matboards.push({
          id: `crescent-${code}`,
          name: name,
          hex_color: hexColor,
          price: pricePerSquareInch,
          code: code,
          crescent_code: code,
          description: `${name} - Crescent Select Conservation Matboard`,
          category: category,
          manufacturer: 'Crescent'
        });
      } catch (err) {
        console.warn(`Error processing match: ${match[0]}`, err);
      }
    }
    
    console.log(`Extracted ${matboards.length} matboards from the catalog`);
    
    if (matboards.length === 0) {
      console.warn('No matboards were extracted. The pattern may need adjustment.');
      
      // Sample the first 1000 characters to help troubleshoot
      console.log('\nSample of catalog text for pattern debugging:');
      console.log(catalogText.substring(0, 1000));
      
      // Try to find some raw matches to help adjust the pattern
      const simpleCodePattern = /[A-Z]\d{3}/g;
      const simpleCodes = catalogText.match(simpleCodePattern) || [];
      if (simpleCodes.length > 0) {
        console.log(`\nFound ${simpleCodes.length} potential codes. Sample:`);
        console.log(simpleCodes.slice(0, 20).join(', '));
        
        // Try to show context around these codes to help pattern design
        console.log('\nContext for the first few codes:');
        for (let i = 0; i < Math.min(5, simpleCodes.length); i++) {
          const codeIndex = catalogText.indexOf(simpleCodes[i]);
          const context = catalogText.substring(
            Math.max(0, codeIndex - 50), 
            Math.min(catalogText.length, codeIndex + 100)
          );
          console.log(`\nContext around ${simpleCodes[i]}:`);
          console.log(context.replace(/\n/g, ' ').replace(/\s+/g, ' '));
        }
      }
    }
    
    // Save to a JSON file for review
    const outputPath = path.join(__dirname, 'extracted_matboards.json');
    fs.writeFileSync(outputPath, JSON.stringify(matboards, null, 2));
    console.log(`Saved matboard data to ${outputPath}`);
    
    return matboards;
  } catch (error) {
    console.error('Error processing catalog text:', error);
    return [];
  }
}

/**
 * Imports the extracted matboard data to Supabase
 * @param {Array} matboards The array of matboard objects to import
 */
async function importToSupabase(matboards) {
  if (matboards.length === 0) {
    console.log('No matboard data to import');
    return;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in environment variables.');
    console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY environment variables.');
    return;
  }
  
  console.log(`Initializing Supabase client with URL: ${supabaseUrl.substring(0, 30)}...`);
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`Importing ${matboards.length} matboards to Supabase...`);
  
  try {
    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < matboards.length; i += batchSize) {
      const batch = matboards.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(matboards.length / batchSize);
      
      console.log(`Processing batch ${batchNum} of ${totalBatches} (${batch.length} items)...`);
      
      const { data, error } = await supabase
        .from('larson_juhl_catalog')
        .upsert(batch, { 
          onConflict: 'id',
          returning: 'minimal'
        });
      
      if (error) {
        console.error(`Error importing batch ${batchNum}:`, error);
      } else {
        console.log(`Successfully imported batch ${batchNum} of ${totalBatches}`);
      }
    }
    
    console.log('Import to Supabase completed!');
  } catch (error) {
    console.error('Error during import process:', error);
  }
}

// Execute the extraction process
console.log('Starting matboard data extraction process...');
const matboardData = extractMatboardData();
console.log(`Extraction complete. Found ${matboardData.length} matboards.`);

// Prompt about importing to Supabase
if (matboardData.length > 0) {
  console.log('\nTo import this data to Supabase, uncomment the importToSupabase line at the end of this file.');
  console.log('Make sure your VITE_SUPABASE_URL and VITE_SUPABASE_KEY environment variables are set correctly.');
  // Uncomment the following line when ready to import
  // importToSupabase(matboardData);
} else {
  console.log('No data to import. Please adjust the extraction patterns and try again.');
}
