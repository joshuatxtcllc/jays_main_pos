
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const parseAndImportLarsonCSV = async (csvFilePath) => {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Parse CSV row - adjust column names based on actual CSV structure
        const frameData = {
          itemNumber: data['Item'] || data['ItemNumber'] || data['SKU'],
          name: data['Description'] || data['Name'],
          width: data['Width'] || data['W'],
          depth: data['Depth'] || data['D'],
          price: data['Price'] || data['Cost'] || data['Wholesale'],
          material: data['Material'] || 'Wood',
          color: data['Color'] || data['Finish'],
          collection: data['Collection'] || data['Series'],
          manufacturer: 'Larson-Juhl'
        };
        
        // Only add if we have essential data
        if (frameData.itemNumber && frameData.name) {
          results.push(frameData);
        }
      })
      .on('end', () => {
        console.log(`Parsed ${results.length} frame records from CSV`);
        resolve(results);
      })
      .on('error', reject);
  });
};

// Function to update vendor API service with CSV data
const updateVendorServiceWithCSVData = async (frameData) => {
  try {
    const vendorServicePath = path.join(process.cwd(), 'server/services/vendorApiService.ts');
    let content = fs.readFileSync(vendorServicePath, 'utf8');
    
    // Generate frame objects for the service
    const frameObjects = frameData.map(frame => `
      {
        id: 'larson-${frame.itemNumber}',
        itemNumber: '${frame.itemNumber}',
        name: '${frame.name}',
        price: '${frame.price}',
        material: '${frame.material}',
        color: '${frame.color}',
        width: '${frame.width}',
        height: '0.75',
        depth: '${frame.depth}',
        collection: '${frame.collection}',
        description: '${frame.name}',
        imageUrl: 'https://www.larsonjuhl.com/images/products/${frame.itemNumber}.jpg',
        inStock: true,
        vendor: 'Larson Juhl'
      }`).join(',');
    
    // Replace the getLarsonSampleFrames method
    const methodRegex = /private getLarsonSampleFrames\(\): VendorFrame\[\] \{[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}/;
    const newMethod = `private getLarsonSampleFrames(): VendorFrame[] {
    return [${frameObjects}
    ];
  }`;
    
    content = content.replace(methodRegex, newMethod);
    fs.writeFileSync(vendorServicePath, content);
    
    console.log('Updated vendorApiService.ts with CSV data');
  } catch (error) {
    console.error('Error updating vendor service:', error);
  }
};

// Usage example
const main = async () => {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.log('Usage: node scripts/parse_larson_csv.js <path-to-csv-file>');
    return;
  }
  
  try {
    const frameData = await parseAndImportLarsonCSV(csvPath);
    await updateVendorServiceWithCSVData(frameData);
    console.log('Successfully imported Larson pricing data from CSV');
  } catch (error) {
    console.error('Error processing CSV:', error);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseAndImportLarsonCSV, updateVendorServiceWithCSVData };
