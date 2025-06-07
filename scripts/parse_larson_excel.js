
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Parse Larson Juhl Excel price sheet and convert to catalog format
 */
async function parseLarsonExcelPriceSheet(filePath) {
  try {
    console.log(`Parsing Excel file: ${filePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const frames = [];
    let headerRow = -1;
    
    // Find header row
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row && Array.isArray(row)) {
        const rowStr = row.join('').toLowerCase();
        if (rowStr.includes('item') || rowStr.includes('number') || rowStr.includes('width') || rowStr.includes('price')) {
          headerRow = i;
          break;
        }
      }
    }
    
    if (headerRow === -1) {
      console.log('Header row not found, using row 0');
      headerRow = 0;
    }
    
    const headers = data[headerRow] || [];
    console.log('Headers found:', headers);
    
    // Map header indices
    const getColumnIndex = (searchTerms) => {
      for (let i = 0; i < headers.length; i++) {
        const header = (headers[i] || '').toString().toLowerCase();
        for (const term of searchTerms) {
          if (header.includes(term.toLowerCase())) {
            return i;
          }
        }
      }
      return -1;
    };
    
    const itemIndex = getColumnIndex(['item', 'number', 'sku', 'code']);
    const nameIndex = getColumnIndex(['name', 'description', 'title']);
    const widthIndex = getColumnIndex(['width', 'w']);
    const heightIndex = getColumnIndex(['height', 'h', 'depth']);
    const priceIndex = getColumnIndex(['price', 'cost', 'wholesale', 'w/s']);
    const materialIndex = getColumnIndex(['material', 'type', 'finish']);
    const colorIndex = getColumnIndex(['color', 'colour', 'finish']);
    
    console.log(`Column indices - Item: ${itemIndex}, Name: ${nameIndex}, Width: ${widthIndex}, Price: ${priceIndex}`);
    
    // Process data rows
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !Array.isArray(row)) continue;
      
      const itemNumber = row[itemIndex];
      const name = row[nameIndex];
      const width = row[widthIndex];
      const price = row[priceIndex];
      
      // Skip rows without essential data
      if (!itemNumber || !price) continue;
      
      // Clean and format data
      const cleanItemNumber = itemNumber.toString().trim();
      const cleanName = name ? name.toString().trim() : `Larson Frame ${cleanItemNumber}`;
      const cleanWidth = width ? parseFloat(width.toString().replace(/[^0-9.]/g, '')) : null;
      const cleanPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
      
      if (isNaN(cleanPrice) || cleanPrice <= 0) continue;
      
      const frame = {
        id: `larson-${cleanItemNumber}`,
        itemNumber: cleanItemNumber,
        name: cleanName,
        manufacturer: 'Larson-Juhl',
        material: row[materialIndex] ? row[materialIndex].toString().trim() : 'Wood',
        color: row[colorIndex] ? row[colorIndex].toString().trim() : 'Natural',
        width: cleanWidth ? cleanWidth.toString() : '2.25',
        height: row[heightIndex] ? parseFloat(row[heightIndex].toString().replace(/[^0-9.]/g, '')) || 1.25 : 1.25,
        price: cleanPrice.toFixed(2),
        vendor: 'Larson Juhl',
        inStock: true,
        catalogImage: `https://www.larsonjuhl.com/contentassets/products/mouldings/${cleanItemNumber}_fab.jpg`,
        edgeTexture: `https://www.larsonjuhl.com/contentassets/products/mouldings/${cleanItemNumber}_edge.jpg`,
        corner: `https://www.larsonjuhl.com/contentassets/products/mouldings/${cleanItemNumber}_corner.jpg`
      };
      
      frames.push(frame);
    }
    
    console.log(`Parsed ${frames.length} frames from Excel file`);
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'larson_catalog_from_excel.json');
    fs.writeFileSync(outputPath, JSON.stringify(frames, null, 2));
    console.log(`Saved catalog to: ${outputPath}`);
    
    return frames;
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Update vendor API service with new catalog data
 */
async function updateVendorService(frames) {
  const vendorServicePath = path.join(__dirname, '..', 'server', 'services', 'vendorApiService.ts');
  
  try {
    let content = fs.readFileSync(vendorServicePath, 'utf8');
    
    // Generate TypeScript-compatible frame objects
    const frameObjects = frames.map(frame => `      {
        id: '${frame.id}',
        itemNumber: '${frame.itemNumber}',
        name: '${frame.name}',
        price: '${frame.price}',
        material: '${frame.material}',
        color: '${frame.color}',
        width: '${frame.width}',
        height: '${frame.height}',
        depth: '${frame.height}',
        collection: 'Professional',
        description: '${frame.name}',
        imageUrl: '${frame.catalogImage}',
        inStock: ${frame.inStock},
        vendor: '${frame.vendor}'
      }`).join(',\n');
    
    // Replace the getLarsonSampleFrames method
    const newMethod = `  private getLarsonSampleFrames(): VendorFrame[] {
    return [
${frameObjects}
    ];
  }`;
    
    // Find and replace the existing method
    const methodRegex = /private getLarsonSampleFrames\(\): VendorFrame\[\] \{[\s\S]*?\n  \}/;
    
    if (methodRegex.test(content)) {
      content = content.replace(methodRegex, newMethod);
      fs.writeFileSync(vendorServicePath, content);
      console.log('Updated vendorApiService.ts with new catalog data');
    } else {
      console.log('Could not find getLarsonSampleFrames method to replace');
    }
    
  } catch (error) {
    console.error('Error updating vendor service:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  
  if (!filePath) {
    console.log('Usage: node parse_larson_excel.js <path-to-excel-file>');
    console.log('Available Excel files in attached_assets:');
    
    const assetsDir = path.join(__dirname, '..', 'attached_assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));
      files.forEach(file => console.log(`  - ${file}`));
    }
    return;
  }
  
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return;
    }
    
    const frames = await parseLarsonExcelPriceSheet(fullPath);
    await updateVendorService(frames);
    
    console.log('\n✓ Excel price sheet processing complete!');
    console.log('The vendor catalog has been updated with the new frame data.');
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseLarsonExcelPriceSheet, updateVendorService };
