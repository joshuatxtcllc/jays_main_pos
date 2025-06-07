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

// Parse CSV and extract frame data
const parseCSV = (csvData) => {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  console.log('CSV Headers:', headers);
  console.log('Total lines to process:', lines.length - 1);

  const frames = [];
  let frameCount = 0;
  let matboardCount = 0;
  let otherCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line handling quoted values
    const values = parseCSVLine(line);

    if (values.length < headers.length - 2) { // Allow some flexibility in column count
      console.log(`Skipping line ${i + 1}: insufficient columns (${values.length} vs ${headers.length})`);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
    });

    // Process different types of items
    const itemClass = (row.Class || '').toLowerCase();
    const description = row.desc || '';

    if (itemClass.includes('frame') || itemClass.includes('moulding')) {
      frameCount++;
      frames.push({
        id: `larson-${row.item || `frame-${frameCount}`}`,
        name: description || `Frame ${row.item}`,
        manufacturer: 'Larson-Juhl',
        material: determineMaterial(description),
        width: parseFloat(row.width) || 0,
        price: parseFloat(row.listprice) || parseFloat(row.chopprice) || 0,
        wholesalePrice: parseFloat(row.chopprice) || parseFloat(row.listprice) || 0,
        retailPrice: parseFloat(row.joinprice) || parseFloat(row.chopprice) || parseFloat(row.listprice) || 0,
        unit: row.um || 'FT',
        category: row.Class || 'Frame Moulding',
        catalogImage: null,
        description: `${description} - ${row.width}" width`,
        inStock: true,
        sku: row.item || '',
        upc: cleanUPC(row.upc),
        boxQuantity: parseInt(row.boxqty) || 0,
        boxPrice: parseFloat(row.boxprice) || 0,
        priceCode: row.pricecode || '',
        wedges: parseInt(row.wedges) || 0,
        supplier: 'Larson-Juhl'
      });
    } else if (itemClass.includes('matboard')) {
      matboardCount++;
      // We could also store matboard data for future use
    } else {
      otherCount++;
      // Other items like glazing, supplies, etc.
    }
  }

  console.log(`Processing summary:`);
  console.log(`- Frame items: ${frameCount}`);
  console.log(`- Matboard items: ${matboardCount}`);
  console.log(`- Other items: ${otherCount}`);

  return frames;
};

// Helper function to determine material from description
const determineMaterial = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('metal') || desc.includes('aluminum') || desc.includes('steel')) {
    return 'Metal';
  } else if (desc.includes('wood') || desc.includes('oak') || desc.includes('maple') || desc.includes('walnut') || desc.includes('cherry')) {
    return 'Wood';
  } else if (desc.includes('plastic') || desc.includes('resin')) {
    return 'Plastic';
  }
  return 'Wood'; // Default
};

// Helper function to clean UPC codes
const cleanUPC = (upc) => {
  if (!upc) return '';
  return upc.replace(/"/g, '').replace(/=/g, '').replace(/^"|"$/g, '');
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