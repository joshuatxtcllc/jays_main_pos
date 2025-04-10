
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the PDF file
const pdfPath = path.join(__dirname, 'attached_assets', 'Larson_price_catalog_USA_en_$10,000 - $24,999.pdf');

/**
 * Parses the Larson-Juhl catalog PDF and extracts matboard data
 * @returns {Promise<string>} The parsed text content of the PDF
 */
async function parsePdfCatalog() {
  try {
    console.log('Reading PDF file from:', pdfPath);
    
    // Check if file exists before attempting to read
    if (!fs.existsSync(pdfPath)) {
      console.error(`File not found: ${pdfPath}`);
      console.log('Please ensure the Larson-Juhl catalog PDF is in the correct location.');
      return null;
    }
    
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log(`Successfully read PDF file (${dataBuffer.length} bytes)`);
    
    console.log('Parsing PDF content...');
    const data = await pdf(dataBuffer, {
      // Configure PDF.js options if needed for better extraction
      pagerender: render => render,
      max: 0, // 0 = no limit
      version: 'v1.10.100'
    });
    
    // Log the total number of pages and a sample of the text
    console.log(`Successfully parsed PDF. Total pages: ${data.numpages}`);
    console.log('PDF text preview (first 500 characters):');
    console.log(data.text.substring(0, 500));
    
    // Save the full text to a file for easier inspection
    const outputPath = path.join(__dirname, 'larson_catalog_text.txt');
    fs.writeFileSync(outputPath, data.text);
    console.log(`\nFull text has been saved to ${outputPath} for inspection`);
    
    // Extract Crescent matboard section
    console.log('\nAttempting to identify Crescent matboard section...');
    const crescentSectionRegex = /CRESCENT\s+SELECT\s+CONSERVATION\s+MATBOARDS|CONSERVATION\s+MATBOARDS/i;
    const crescentMatch = data.text.match(crescentSectionRegex);
    
    if (crescentMatch) {
      console.log('Found Crescent matboard section at position:', crescentMatch.index);
      // You could extract just the relevant section for further processing
    } else {
      console.log('Crescent matboard section not clearly identified. Processing full text.');
    }
    
    // Begin to identify potential matboard entries
    console.log('\nScanning for potential matboard code patterns...');
    // Looking for patterns like: C100, W200, etc. (letter followed by 3 digits)
    const matboardCodeRegex = /[A-Z]\d{3}/g;
    const potentialCodes = data.text.match(matboardCodeRegex) || [];
    
    if (potentialCodes.length > 0) {
      console.log(`Found ${potentialCodes.length} potential matboard codes.`);
      console.log('Sample codes:', potentialCodes.slice(0, 10).join(', '));
    } else {
      console.log('No standard matboard codes found. May need to adjust the pattern.');
    }
    
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error.code === 'ENOENT') {
      console.log('The PDF file was not found. Please check the path and file name.');
    } else if (error.message.includes('file corrupt')) {
      console.log('The PDF file appears to be corrupt or in an invalid format.');
    } else {
      console.log('An unexpected error occurred during PDF parsing.');
    }
    return null;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  // Run the function and handle the results only if this module is executed directly
  parsePdfCatalog()
    .then(text => {
      if (text) {
        console.log('PDF parsing completed successfully.');
      } else {
        console.log('PDF parsing failed or returned no content.');
      }
    })
    .catch(err => {
      console.error('Unexpected error running parsePdfCatalog:', err);
    });
}

// Export the function for use in other modules
export { parsePdfCatalog };
