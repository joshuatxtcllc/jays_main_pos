/**
 * Update Larson-Juhl Catalog
 * 
 * This script enhances the Larson-Juhl catalog to include both matboards and frames
 * with appropriate categorization and metadata.
 */

import fs from 'fs';
import path from 'path';
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Frame material categories with common attributes
const frameMaterials = {
  'wood': {
    categories: ['traditional', 'classic', 'ornate', 'contemporary'], 
    edge_textures: ['smooth', 'carved', 'textured', 'fluted']
  },
  'metal': {
    categories: ['modern', 'contemporary', 'minimalist'],
    edge_textures: ['smooth', 'brushed', 'hammered']
  },
  'composite': {
    categories: ['contemporary', 'budget'],
    edge_textures: ['smooth', 'textured']
  }
};

/**
 * Updates existing matboard records to ensure they have the 'matboard' type
 */
async function updateExistingMatboards() {
  console.log('Updating existing matboard records...');
  
  const query = `
    UPDATE larson_juhl_catalog
    SET type = 'matboard'
    WHERE type IS NULL OR type = '';
  `;
  
  try {
    const result = await pool.query(query);
    console.log(`Updated ${result.rowCount} matboard records`);
    return true;
  } catch (error) {
    console.error('Error updating matboard records:', error);
    return false;
  }
}

/**
 * Copies frame data from frames table to larson_juhl_catalog
 */
async function importFramesToLarsonCatalog() {
  console.log('Importing frames to Larson-Juhl catalog...');
  
  try {
    // First, get all frames from the frames table
    const framesQuery = `
      SELECT * FROM frames 
      WHERE manufacturer = 'Larson-Juhl' 
      OR manufacturer = 'Roma Moulding'
      OR manufacturer = 'Nielsen Bainbridge';
    `;
    
    const framesResult = await pool.query(framesQuery);
    console.log(`Found ${framesResult.rows.length} frames to import`);
    
    // Check if these frames already exist in the catalog
    for (const frame of framesResult.rows) {
      const checkQuery = `
        SELECT id FROM larson_juhl_catalog 
        WHERE id = $1 AND type = 'frame';
      `;
      
      const checkResult = await pool.query(checkQuery, [frame.id]);
      
      if (checkResult.rows.length === 0) {
        // Frame doesn't exist in catalog, insert it
        console.log(`Importing frame: ${frame.name} (${frame.id})`);
        
        // Determine material and attributes based on frame properties
        const material = determineFrameMaterial(frame.name, frame.description);
        const category = determineFrameCategory(frame.name, material);
        const edgeTexture = determineEdgeTexture(frame.name, material);
        const frameWidth = frame.width || determineMeasurementFromDescription(frame.description, 'width');
        const frameDepth = frame.depth || determineMeasurementFromDescription(frame.description, 'depth');
        
        const insertQuery = `
          INSERT INTO larson_juhl_catalog (
            id, name, price, code, description, category, manufacturer, 
            type, material, width, depth, edge_texture, corner
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 'frame', $8, $9, $10, $11, $12
          );
        `;
        
        const values = [
          frame.id,
          frame.name, 
          frame.price,
          frame.code || frame.id.split('-')[1],
          frame.description,
          category,
          frame.manufacturer,
          material,
          frameWidth,
          frameDepth,
          edgeTexture,
          'standard' // Default corner type
        ];
        
        await pool.query(insertQuery, values);
      } else {
        console.log(`Frame ${frame.id} already exists in catalog`);
      }
    }
    
    console.log('Frame import completed');
    return true;
  } catch (error) {
    console.error('Error importing frames:', error);
    return false;
  }
}

/**
 * Determines the most likely material of a frame based on its name and description
 */
function determineFrameMaterial(name, description) {
  const nameAndDesc = (name + ' ' + (description || '')).toLowerCase();
  
  if (/wood|maple|oak|pine|walnut|cherry|mahogany|ash|birch/i.test(nameAndDesc)) {
    return 'wood';
  } else if (/metal|aluminum|steel|copper|bronze|gold|silver/i.test(nameAndDesc)) {
    return 'metal';
  } else if (/plastic|resin|composite|polymer/i.test(nameAndDesc)) {
    return 'composite';
  } 
  
  // Default to wood as most common
  return 'wood';
}

/**
 * Determines the most likely category based on frame name and material
 */
function determineFrameCategory(name, material) {
  const lowerName = name.toLowerCase();
  
  // Get possible categories for this material
  const possibleCategories = frameMaterials[material]?.categories || ['traditional'];
  
  for (const category of possibleCategories) {
    if (lowerName.includes(category)) {
      return category;
    }
  }
  
  // Check for specific keywords
  if (/ornate|antique|classic|gold leaf|silver leaf/i.test(lowerName)) {
    return 'ornate';
  } else if (/modern|contemporary|sleek/i.test(lowerName)) {
    return 'contemporary';
  } else if (/thin|narrow|minimal/i.test(lowerName)) {
    return 'minimalist';
  }
  
  // Return first possible category as default
  return possibleCategories[0];
}

/**
 * Determines the edge texture based on frame name and material
 */
function determineEdgeTexture(name, material) {
  const lowerName = name.toLowerCase();
  
  // Get possible textures for this material
  const possibleTextures = frameMaterials[material]?.edge_textures || ['smooth'];
  
  for (const texture of possibleTextures) {
    if (lowerName.includes(texture)) {
      return texture;
    }
  }
  
  // Check for specific keywords
  if (/carved|ornate|detailed|embossed/i.test(lowerName)) {
    return 'carved';
  } else if (/smooth|flat|clean/i.test(lowerName)) {
    return 'smooth';
  } else if (/textured|rough|grained/i.test(lowerName)) {
    return 'textured';
  }
  
  // Return first possible texture as default
  return possibleTextures[0];
}

/**
 * Extracts measurements from description text
 */
function determineMeasurementFromDescription(description, dimension) {
  if (!description) return dimension === 'width' ? 1.5 : 0.75; // Default values
  
  const dimensionPattern = dimension === 'width' 
    ? /(\d+(\.\d+)?)\s*(inch|in|"|''|cm)?\s*(wide|width)/i
    : /(\d+(\.\d+)?)\s*(inch|in|"|''|cm)?\s*(deep|depth)/i;
  
  const match = description.match(dimensionPattern);
  
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  // If no specific matches, look for standard measurement patterns
  const measurementPattern = /(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/i;
  const measureMatch = description.match(measurementPattern);
  
  if (measureMatch) {
    // If we found a pattern like "1.5 x 0.75", assume first is width, second is depth
    return dimension === 'width' ? parseFloat(measureMatch[1]) : parseFloat(measureMatch[3]);
  }
  
  // Return defaults if no matches
  return dimension === 'width' ? 1.5 : 0.75;
}

/**
 * Main function to run the entire process
 */
async function main() {
  try {
    // Apply migrations if specified
    if (process.argv[2] === '--with-migration' && process.argv[3]) {
      const migrationPath = process.argv[3];
      console.log(`Applying migration: ${migrationPath}`);
      
      // Execute migration script
      const result = spawnSync('node', ['scripts/apply_migration.js', migrationPath], { stdio: 'inherit' });
      
      if (result.status !== 0) {
        console.error('Migration failed, aborting catalog update');
        process.exit(1);
      }
    }
    
    // Step 1: Update existing matboards
    const matboardsUpdated = await updateExistingMatboards();
    if (!matboardsUpdated) {
      console.error('Failed to update existing matboards, continuing anyway...');
    }
    
    // Step 2: Import frames into catalog
    const framesImported = await importFramesToLarsonCatalog();
    if (!framesImported) {
      console.error('Failed to import frames to catalog');
      process.exit(1);
    }
    
    console.log('Larson-Juhl catalog update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Catalog update failed with error:', error);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
}

main();