/**
 * Apply Database Migration Script
 * 
 * This script runs SQL migration files to update the database schema.
 * Usage: node scripts/apply_migration.js migrations/002_add_multiple_mat_frame_support.sql
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const { config } = require('dotenv');

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

async function applyMigration(migrationPath) {
  console.log(`Applying migration: ${migrationPath}`);
  
  try {
    // Read migration file
    const sql = fs.readFileSync(path.resolve(process.cwd(), migrationPath), 'utf8');
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('Transaction started');
      
      // Split the SQL file by semicolons to execute multiple statements
      const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          console.log(`Executing statement ${i + 1}/${statements.length}`);
          await client.query(statement);
        }
      }
      
      await client.query('COMMIT');
      console.log('Transaction committed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log(`Migration applied successfully: ${migrationPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to apply migration ${migrationPath}:`, error);
    return false;
  }
}

async function main() {
  // Get migration file path from command-line arguments
  const migrationPath = process.argv[2];
  
  if (!migrationPath) {
    console.error('Please provide a migration file path');
    console.error('Usage: node scripts/apply_migration.js migrations/002_add_multiple_mat_frame_support.sql');
    process.exit(1);
  }
  
  // Check if the migration file exists
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  try {
    const success = await applyMigration(migrationPath);
    if (success) {
      console.log('Migration completed successfully');
      process.exit(0);
    } else {
      console.error('Migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  } finally {
    // Close pool
    await pool.end();
  }
}

main();