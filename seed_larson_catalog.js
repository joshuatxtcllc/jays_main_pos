/**
 * Seed Larson Juhl Catalog
 * 
 * This script creates a set of sample Crescent matboard entries
 * and inserts them directly into the database.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

config();

// Sample Crescent matboard data
const crescentMatboards = [
  {
    id: randomUUID(),
    name: "Antique White",
    manufacturer: "Crescent",
    category: "Conservation",
    description: "Acid-free, lignin-free conservation matboard",
    color: "White",
    colorHex: "#F5F5F0",
    price: "12.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Black",
    manufacturer: "Crescent",
    category: "Conservation",
    description: "Acid-free, lignin-free conservation matboard",
    color: "Black",
    colorHex: "#000000",
    price: "12.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Navy",
    manufacturer: "Crescent",
    category: "Conservation",
    description: "Acid-free, lignin-free conservation matboard",
    color: "Navy",
    colorHex: "#000080",
    price: "12.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Ivory",
    manufacturer: "Crescent",
    category: "Conservation",
    description: "Acid-free, lignin-free conservation matboard",
    color: "Ivory",
    colorHex: "#FFFFF0",
    price: "12.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Warm White",
    manufacturer: "Crescent",
    category: "Select",
    description: "Acid-free, lignin-free select matboard",
    color: "White",
    colorHex: "#F5F5DC",
    price: "9.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Cobalt Blue",
    manufacturer: "Crescent",
    category: "Select",
    description: "Acid-free, lignin-free select matboard",
    color: "Blue",
    colorHex: "#0047AB",
    price: "9.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Burgundy",
    manufacturer: "Crescent",
    category: "Select",
    description: "Acid-free, lignin-free select matboard",
    color: "Red",
    colorHex: "#800020",
    price: "9.99",
    dimensions: "32x40",
    thickness: "4-ply"
  },
  {
    id: randomUUID(),
    name: "Forest Green",
    manufacturer: "Crescent",
    category: "Select",
    description: "Acid-free, lignin-free select matboard",
    color: "Green",
    colorHex: "#228B22",
    price: "9.99",
    dimensions: "32x40",
    thickness: "4-ply"
  }
];

/**
 * Inserts sample Crescent matboards directly into the database
 */
async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create a connection pool to the PostgreSQL database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // First, make sure the table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "larson_juhl_catalog" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "manufacturer" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "color" TEXT,
        "colorHex" TEXT,
        "price" TEXT NOT NULL,
        "dimensions" TEXT,
        "thickness" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Table "larson_juhl_catalog" created or already exists');

    // Clear existing Crescent matboards
    await pool.query(`
      DELETE FROM "larson_juhl_catalog"
      WHERE "manufacturer" = 'Crescent'
    `);

    console.log('Cleared existing Crescent matboards');

    // Insert sample Crescent matboards
    for (const matboard of crescentMatboards) {
      await pool.query(`
        INSERT INTO "larson_juhl_catalog" (
          "id", "name", "manufacturer", "category", "description", 
          "color", "colorHex", "price", "dimensions", "thickness"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        matboard.id,
        matboard.name,
        matboard.manufacturer,
        matboard.category,
        matboard.description,
        matboard.color,
        matboard.colorHex,
        matboard.price,
        matboard.dimensions,
        matboard.thickness
      ]);
    }

    console.log(`Added ${crescentMatboards.length} Crescent matboards to the database`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedDatabase().catch(console.error);