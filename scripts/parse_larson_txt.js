import fs from 'fs';
import path from 'path';

// Helper function to parse CSV-like lines with proper quote handling
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  // Add the last field
  result.push(current.trim());
  return result;
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

// Function to update vendor API service with parsed data
const updateVendorServiceWithParsedData = async (frames) => {
  try {
    const vendorServicePath = path.join(process.cwd(), 'server/services/vendorApiService.ts');
    let content = fs.readFileSync(vendorServicePath, 'utf8');

    // Generate frame objects for the service
    const frameObjects = frames.map(frame => `
      {
        id: '${frame.id}',
        itemNumber: '${frame.sku}',
        name: '${frame.name.replace(/'/g, "\\'")}',
        price: '${frame.price}',
        material: '${frame.material}',
        color: 'Natural',
        width: '${frame.width}',
        height: '0.75',
        depth: '1.5',
        collection: '${frame.category}',
        description: '${frame.description.replace(/'/g, "\\'")}',
        imageUrl: 'https://www.larsonjuhl.com/images/products/${frame.sku}.jpg',
        inStock: true,
        vendor: 'Larson Juhl'
      }`).join(',');

    // Find and replace the getLarsonSampleFrames method
    const methodRegex = /private getLarsonSampleFrames\(\): VendorFrame\[\] \{[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}/;

    if (methodRegex.test(content)) {
      const newMethod = `private getLarsonSampleFrames(): VendorFrame[] {
    return [${frameObjects}
    ];
  }`;

      content = content.replace(methodRegex, newMethod);
      fs.writeFileSync(vendorServicePath, content);
      console.log('✓ Updated vendorApiService.ts with parsed pricing data');
    } else {
      console.log('Could not find getLarsonSampleFrames method to replace');
    }
  } catch (error) {
    console.error('Error updating vendor service:', error);
  }
};

// Main parsing function
const parseLarsonPricingText = (textPath) => {
  try {
    console.log(`Reading Larson pricing text from: ${textPath}`);
    const text = fs.readFileSync(textPath, 'utf8');

    const frames = [];
    const matboards = [];

    // Split into lines and process
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and headers
      if (!line || line.includes('Box Qty') || line.includes('Width') || line.includes('$9,999')) {
        continue;
      }

      // Look for lines that match the pricing pattern: Item# Width BoxQty Collection ... prices
      const pricingMatch = line.match(/^\s*(\S+)\s+([^"]*?)\s+(\d+)\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/);

      if (pricingMatch) {
        const [, itemNumber, width, boxQty, collection, boxPrice, lengthPrice, chopPrice, joinPrice] = pricingMatch;

        // Clean up the collection name
        const cleanCollection = collection.replace(/"/g, '').trim();

        // Create frame object
        const frame = {
          id: `larson-${itemNumber}`,
          name: `${cleanCollection} ${width} Frame`,
          manufacturer: 'Larson-Juhl',
          material: determineMaterial(cleanCollection),
          width: parseFloat(width.replace(/[^0-9.\/]/g, '')) || 0,
          price: parseFloat(lengthPrice) || 0, // Use length price as base price
          wholesalePrice: parseFloat(lengthPrice) || 0,
          chopPrice: parseFloat(chopPrice) || 0,
          joinPrice: parseFloat(joinPrice) || 0,
          boxPrice: parseFloat(boxPrice) || 0,
          retailPrice: parseFloat(joinPrice) || parseFloat(chopPrice) || parseFloat(lengthPrice) || 0,
          unit: 'FT',
          category: 'Frame Moulding',
          catalogImage: null,
          description: `${cleanCollection} - ${width} width`,
          inStock: true,
          sku: itemNumber,
          boxQuantity: parseInt(boxQty) || 0,
          collection: cleanCollection,
          supplier: 'Larson-Juhl'
        };

        frames.push(frame);
      }
    }

    console.log(`Parsed ${frames.length} frames and ${matboards.length} matboards`);

    // Save to JSON files
    fs.writeFileSync(path.join(process.cwd(), 'larson_frames_parsed.json'), JSON.stringify(frames, null, 2));
    fs.writeFileSync(path.join(process.cwd(), 'larson_matboards_parsed.json'), JSON.stringify(matboards, null, 2));

    console.log(`Saved ${frames.length} frames to: ${path.join(process.cwd(), 'larson_frames_parsed.json')}`);
    console.log(`Saved ${matboards.length} matboards to: ${path.join(process.cwd(), 'larson_matboards_parsed.json')}`);

    return { frames, matboards };
  } catch (error) {
    console.error('Error parsing Larson pricing text:', error);
    return { frames: [], matboards: [] };
  }
};

// Main execution
const main = async () => {
  const textPath = path.join(process.cwd(), 'attached_assets/Larson Price list 2025_1749322275157.txt');

  if (!fs.existsSync(textPath)) {
    console.error('Larson pricing text file not found at:', textPath);
    return;
  }

  const { frames, matboards } = parseLarsonPricingText(textPath);

  if (frames.length > 0) {
    await updateVendorServiceWithParsedData(frames);
    console.log('\n✓ Larson Juhl pricing data processing complete!');
    console.log('The vendor catalog has been updated with real pricing data.');
  } else {
    console.log('No pricing data was extracted. Please check the file format.');
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseLarsonPricingText, updateVendorServiceWithParsedData };