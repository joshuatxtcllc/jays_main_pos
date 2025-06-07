
import fs from 'fs';
import path from 'path';

/**
 * Parse Larson Juhl pricing data from text file
 */
async function parseLarsonTextFile(textFilePath) {
  try {
    console.log(`Reading Larson pricing text from: ${textFilePath}`);
    
    const textContent = fs.readFileSync(textFilePath, 'utf8');
    const lines = textContent.split('\n');
    
    const frames = [];
    const matboards = [];
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Detect sections
      if (line.includes('WOOD MOULDINGS') || line.includes('METAL MOULDINGS')) {
        currentSection = 'mouldings';
        continue;
      } else if (line.includes('MATBOARDS')) {
        currentSection = 'matboards';
        continue;
      } else if (line.includes('GLASS') || line.includes('ACRYLIC') || line.includes('FOAMBOARD')) {
        currentSection = 'supplies';
        continue;
      }
      
      // Parse wood mouldings
      if (currentSection === 'mouldings' && line.match(/^\s*(\w+[-\w]*)\s+(.+?)\s+(\d+)\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/)) {
        const frameData = parseMouldingLine(line);
        if (frameData) {
          frames.push(frameData);
        }
      }
      
      // Parse metal mouldings (different format)
      else if (currentSection === 'mouldings' && line.match(/^\s*([A-Z]\w+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/)) {
        const frameData = parseMetalMouldingLine(line);
        if (frameData) {
          frames.push(frameData);
        }
      }
      
      // Parse matboards
      else if (currentSection === 'matboards' && line.match(/^\s*([A-Z]\d+)\s+(.+?)\s+(\d+)\s+([\d.]+)/)) {
        const matboardData = parseMatboardLine(line);
        if (matboardData) {
          matboards.push(matboardData);
        }
      }
    }
    
    console.log(`Parsed ${frames.length} frames and ${matboards.length} matboards`);
    return { frames, matboards };
    
  } catch (error) {
    console.error('Error parsing Larson text file:', error);
    throw error;
  }
}

function parseMouldingLine(line) {
  // Match pattern: Item# Width BoxQty Collection BasePricePerFoot BoxPrice LengthPrice ChopPrice JoinPrice
  const match = line.match(/^\s*(\w+[-\w]*)\s+(["\d/\s]+)\s+(\d+)\s+(.+?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/);
  
  if (!match) return null;
  
  const [, itemNumber, width, boxQty, collection, basePricePerFoot, boxPrice, lengthPrice, chopPrice] = match;
  
  return {
    id: `larson-${itemNumber}`,
    itemNumber: itemNumber.trim(),
    name: `${collection.trim()} ${width.trim()}`,
    manufacturer: 'Larson-Juhl',
    material: determineMaterial(collection),
    color: determineColor(collection),
    width: parseWidth(width),
    height: '0.75', // Standard depth for moulding
    depth: '0.75',
    price: parseFloat(chopPrice).toFixed(2),
    wholesalePrice: parseFloat(basePricePerFoot).toFixed(2),
    retailPrice: parseFloat(lengthPrice).toFixed(2),
    boxQuantity: parseInt(boxQty),
    boxPrice: parseFloat(boxPrice).toFixed(2),
    collection: collection.trim(),
    unit: 'FT',
    category: 'Frame Moulding',
    description: `${collection.trim()} - ${width.trim()} width`,
    inStock: true,
    vendor: 'Larson Juhl',
    catalogImage: `https://www.larsonjuhl.com/contentassets/products/mouldings/${itemNumber}_fab.jpg`,
    edgeTexture: determineEdgeTexture(collection),
    corner: 'standard'
  };
}

function parseMetalMouldingLine(line) {
  // Match pattern for metal mouldings: Item# BoxPrice LengthPrice ChopPrice
  const match = line.match(/^\s*([A-Z]\w+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/);
  
  if (!match) return null;
  
  const [, itemNumber, boxPrice, lengthPrice, chopPrice] = match;
  
  return {
    id: `larson-${itemNumber}`,
    itemNumber: itemNumber.trim(),
    name: `Metal Moulding ${itemNumber}`,
    manufacturer: 'Larson-Juhl',
    material: 'Metal',
    color: determineMetalColor(itemNumber),
    width: '0.5', // Default metal width
    height: '0.5',
    depth: '0.5',
    price: parseFloat(chopPrice).toFixed(2),
    wholesalePrice: parseFloat(boxPrice).toFixed(2),
    retailPrice: parseFloat(lengthPrice).toFixed(2),
    collection: 'Metal Mouldings',
    unit: 'FT',
    category: 'Frame Moulding',
    description: `Metal Moulding ${itemNumber}`,
    inStock: true,
    vendor: 'Larson Juhl',
    catalogImage: `https://www.larsonjuhl.com/contentassets/products/mouldings/${itemNumber}_fab.jpg`,
    edgeTexture: 'smooth',
    corner: 'standard'
  };
}

function parseMatboardLine(line) {
  // Match pattern: Item# ProductName PackSize PackPrice
  const match = line.match(/^\s*([A-Z]\d+)\s+(.+?)\s+(\d+)\s+([\d.]+)/);
  
  if (!match) return null;
  
  const [, itemNumber, productName, packSize, packPrice] = match;
  
  return {
    id: `larson-mat-${itemNumber}`,
    itemNumber: itemNumber.trim(),
    name: productName.trim(),
    manufacturer: determineMatboardManufacturer(productName),
    category: determineMatboardCategory(productName),
    color: extractMatboardColor(productName),
    dimensions: extractDimensions(productName),
    thickness: extractThickness(productName),
    price: parseFloat(packPrice).toFixed(2),
    packSize: parseInt(packSize),
    type: 'matboard',
    description: productName.trim(),
    inStock: true,
    vendor: 'Larson Juhl'
  };
}

// Helper functions
function determineMaterial(collection) {
  const collectionLower = collection.toLowerCase();
  if (collectionLower.includes('metal') || collectionLower.includes('aluminum')) {
    return 'Metal';
  } else if (collectionLower.includes('wood') || collectionLower.includes('maple') || 
             collectionLower.includes('walnut') || collectionLower.includes('oak')) {
    return 'Wood';
  }
  return 'Wood'; // Default
}

function determineColor(collection) {
  const collectionLower = collection.toLowerCase();
  if (collectionLower.includes('black')) return 'Black';
  if (collectionLower.includes('white')) return 'White';
  if (collectionLower.includes('gold')) return 'Gold';
  if (collectionLower.includes('silver')) return 'Silver';
  if (collectionLower.includes('brown')) return 'Brown';
  if (collectionLower.includes('natural')) return 'Natural';
  return 'Natural'; // Default
}

function determineMetalColor(itemNumber) {
  const item = itemNumber.toLowerCase();
  if (item.includes('black') || item.includes('bk')) return 'Black';
  if (item.includes('white') || item.includes('wh')) return 'White';
  if (item.includes('gold') || item.includes('gd')) return 'Gold';
  if (item.includes('silver') || item.includes('sv')) return 'Silver';
  return 'Natural';
}

function determineEdgeTexture(collection) {
  const collectionLower = collection.toLowerCase();
  if (collectionLower.includes('carved') || collectionLower.includes('ornate')) return 'carved';
  if (collectionLower.includes('smooth') || collectionLower.includes('flat')) return 'smooth';
  if (collectionLower.includes('textured') || collectionLower.includes('rough')) return 'textured';
  return 'smooth'; // Default
}

function parseWidth(widthStr) {
  // Parse width like "1 3/8\"" or "5/8\"" to decimal
  const cleaned = widthStr.replace(/"/g, '').trim();
  
  if (cleaned.includes('/')) {
    const parts = cleaned.split(/\s+/);
    let total = 0;
    
    for (const part of parts) {
      if (part.includes('/')) {
        const [num, den] = part.split('/');
        total += parseFloat(num) / parseFloat(den);
      } else {
        total += parseFloat(part);
      }
    }
    return total.toFixed(3);
  }
  
  return parseFloat(cleaned) || 1.0;
}

function determineMatboardManufacturer(productName) {
  const name = productName.toLowerCase();
  if (name.includes('artique')) return 'Artique';
  if (name.includes('crescent')) return 'Crescent';
  if (name.includes('bainbridge')) return 'Bainbridge';
  return 'Larson-Juhl';
}

function determineMatboardCategory(productName) {
  const name = productName.toLowerCase();
  if (name.includes('conservation')) return 'Conservation';
  if (name.includes('rag')) return 'Rag';
  if (name.includes('fabric')) return 'Fabric';
  if (name.includes('specialty')) return 'Specialty';
  return 'Standard';
}

function extractMatboardColor(productName) {
  const name = productName.toLowerCase();
  const colors = ['white', 'black', 'cream', 'ivory', 'gray', 'grey', 'red', 'blue', 'green', 'yellow', 'brown', 'tan', 'beige'];
  
  for (const color of colors) {
    if (name.includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  return 'White'; // Default
}

function extractDimensions(productName) {
  const dimensionMatch = productName.match(/(\d+)\s*x\s*(\d+)/);
  return dimensionMatch ? `${dimensionMatch[1]}x${dimensionMatch[2]}` : '32x40';
}

function extractThickness(productName) {
  if (productName.includes('8 ply')) return '8-ply';
  if (productName.includes('6 ply')) return '6-ply';
  return '4-ply'; // Default
}

/**
 * Update vendor API service with parsed data
 */
async function updateVendorServiceWithData(frames, matboards) {
  const vendorServicePath = path.join(process.cwd(), 'server/services/vendorApiService.ts');
  
  try {
    let content = fs.readFileSync(vendorServicePath, 'utf8');
    
    // Generate frame objects for the service
    const frameObjects = frames.slice(0, 50).map(frame => `      {
        id: '${frame.id}',
        itemNumber: '${frame.itemNumber}',
        name: '${frame.name}',
        price: '${frame.price}',
        material: '${frame.material}',
        color: '${frame.color}',
        width: '${frame.width}',
        height: '${frame.height}',
        depth: '${frame.depth}',
        collection: '${frame.collection}',
        description: '${frame.description}',
        imageUrl: '${frame.catalogImage}',
        inStock: ${frame.inStock},
        vendor: '${frame.vendor}'
      }`).join(',\n');
    
    // Replace the getLarsonSampleFrames method
    const methodRegex = /private getLarsonSampleFrames\(\): VendorFrame\[\] \{[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}/;
    const newMethod = `private getLarsonSampleFrames(): VendorFrame[] {
    return [
${frameObjects}
    ];
  }`;
    
    if (methodRegex.test(content)) {
      content = content.replace(methodRegex, newMethod);
      fs.writeFileSync(vendorServicePath, content);
      console.log('Updated vendorApiService.ts with parsed Larson pricing data');
    } else {
      console.log('Could not find getLarsonSampleFrames method to replace');
    }
    
  } catch (error) {
    console.error('Error updating vendor service:', error);
  }
}

// Main execution
async function main() {
  const textFilePath = path.join(process.cwd(), 'attached_assets/Larson Price list 2025_1749322275157.txt');
  
  try {
    if (!fs.existsSync(textFilePath)) {
      console.error(`File not found: ${textFilePath}`);
      return;
    }
    
    const { frames, matboards } = await parseLarsonTextFile(textFilePath);
    
    // Save parsed data to JSON files for reference
    const framesOutputPath = path.join(process.cwd(), 'larson_frames_parsed.json');
    const matboardsOutputPath = path.join(process.cwd(), 'larson_matboards_parsed.json');
    
    fs.writeFileSync(framesOutputPath, JSON.stringify(frames, null, 2));
    fs.writeFileSync(matboardsOutputPath, JSON.stringify(matboards, null, 2));
    
    console.log(`Saved ${frames.length} frames to: ${framesOutputPath}`);
    console.log(`Saved ${matboards.length} matboards to: ${matboardsOutputPath}`);
    
    // Update vendor service
    await updateVendorServiceWithData(frames, matboards);
    
    console.log('\n✓ Larson Juhl pricing data processing complete!');
    console.log('The vendor catalog has been updated with real pricing data.');
    
  } catch (error) {
    console.error('Error processing Larson pricing data:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseLarsonTextFile, updateVendorServiceWithData };
