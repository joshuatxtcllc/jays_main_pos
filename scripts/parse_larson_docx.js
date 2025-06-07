
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { db } = require('../server/db');

/**
 * Parse Larson Juhl 2025 Price List from Word document
 * Extracts pricing data and populates the vendor catalog
 */

async function parseLarsonDocx() {
  const docxPath = path.join(__dirname, '../attached_assets/Larson Price list 2025_1749319639835.docx');
  
  try {
    console.log('Reading Larson Juhl price list document...');
    
    // Extract text from Word document
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value;
    
    console.log('Document extracted, parsing pricing data...');
    
    // Parse the text to extract frame data
    const frames = parseFrameData(text);
    
    console.log(`Found ${frames.length} frame entries`);
    
    // Insert into database
    await insertFramesToDatabase(frames);
    
    console.log('Larson Juhl pricing data successfully imported');
    
  } catch (error) {
    console.error('Error parsing Larson Juhl document:', error);
    throw error;
  }
}

function parseFrameData(text) {
  const frames = [];
  const lines = text.split('\n');
  
  let currentCollection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Detect collection headers
    if (isCollectionHeader(trimmedLine)) {
      currentCollection = extractCollectionName(trimmedLine);
      continue;
    }
    
    // Parse frame entries
    const frameData = parseFrameLine(trimmedLine, currentCollection);
    if (frameData) {
      frames.push(frameData);
    }
  }
  
  return frames;
}

function isCollectionHeader(line) {
  // Collection headers typically contain words like "Collection", "Series", or are in all caps
  return /collection|series/i.test(line) || 
         (line === line.toUpperCase() && line.length > 3 && !/\d/.test(line));
}

function extractCollectionName(line) {
  return line.replace(/collection|series/gi, '').trim();
}

function parseFrameLine(line, collection) {
  // Look for patterns like: "210285 1.25" x 0.75" White Wood $16.75"
  const framePattern = /(\d{5,6})\s+([0-9.]+["']?\s*x\s*[0-9.]+["']?)\s+(.+?)\s+\$([0-9.]+)/i;
  
  const match = line.match(framePattern);
  
  if (match) {
    const [, itemNumber, dimensions, description, price] = match;
    
    // Parse dimensions
    const dimMatch = dimensions.match(/([0-9.]+)["']?\s*x\s*([0-9.]+)["']?/);
    const width = dimMatch ? dimMatch[1] : '1.5';
    const depth = dimMatch ? dimMatch[2] : '0.75';
    
    // Extract material and color from description
    const material = extractMaterial(description);
    const color = extractColor(description);
    
    return {
      id: `larson-${itemNumber}`,
      itemNumber,
      name: `Larson ${collection} ${color}`.trim(),
      manufacturer: 'Larson-Juhl',
      material,
      color,
      width,
      depth,
      price,
      collection: collection || 'Standard',
      description: description.trim(),
      catalogImage: `https://www.larsonjuhl.com/contentassets/products/mouldings/${itemNumber}_fab.jpg`,
      edgeTexture: determineEdgeTexture(description),
      corner: 'standard'
    };
  }
  
  return null;
}

function extractMaterial(description) {
  const desc = description.toLowerCase();
  
  if (/wood|maple|oak|pine|walnut|cherry|mahogany/i.test(desc)) {
    return 'Wood';
  } else if (/metal|aluminum|steel|copper|bronze/i.test(desc)) {
    return 'Metal';
  } else if (/plastic|resin|composite/i.test(desc)) {
    return 'Composite';
  }
  
  return 'Wood'; // Default
}

function extractColor(description) {
  const colorMap = {
    'white': 'White',
    'black': 'Black',
    'gold': 'Gold',
    'silver': 'Silver',
    'brown': 'Brown',
    'natural': 'Natural',
    'walnut': 'Walnut',
    'cherry': 'Cherry',
    'maple': 'Maple'
  };
  
  const desc = description.toLowerCase();
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (desc.includes(key)) {
      return value;
    }
  }
  
  return 'Natural'; // Default
}

function determineEdgeTexture(description) {
  const desc = description.toLowerCase();
  
  if (/smooth|flat|clean/i.test(desc)) {
    return 'smooth';
  } else if (/carved|ornate|detailed|embossed/i.test(desc)) {
    return 'carved';
  } else if (/textured|rough|grained/i.test(desc)) {
    return 'textured';
  }
  
  return 'smooth'; // Default
}

async function insertFramesToDatabase(frames) {
  console.log(`Inserting ${frames.length} frames into database...`);
  
  for (const frame of frames) {
    try {
      // Check if frame already exists
      const existing = await db.query(
        'SELECT id FROM frames WHERE id = $1',
        [frame.id]
      );
      
      if (existing.rows.length === 0) {
        // Insert new frame
        await db.query(`
          INSERT INTO frames (
            id, name, manufacturer, material, width, depth, price,
            catalog_image, color, edge_texture, corner
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          frame.id,
          frame.name,
          frame.manufacturer,
          frame.material,
          frame.width,
          frame.depth,
          frame.price,
          frame.catalogImage,
          frame.color,
          frame.edgeTexture,
          frame.corner
        ]);
      } else {
        // Update existing frame
        await db.query(`
          UPDATE frames SET
            name = $2, price = $3, catalog_image = $4
          WHERE id = $1
        `, [frame.id, frame.name, frame.price, frame.catalogImage]);
      }
    } catch (error) {
      console.error(`Error inserting frame ${frame.id}:`, error);
    }
  }
}

// Run the parser
if (require.main === module) {
  parseLarsonDocx()
    .then(() => {
      console.log('Larson Juhl import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

module.exports = { parseLarsonDocx };
