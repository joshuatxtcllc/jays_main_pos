/**
 * Database Backup Script for Jays Frames POS System
 * 
 * This script creates a backup of the PostgreSQL database and can be scheduled
 * to run automatically at regular intervals using cron or a similar scheduler.
 */

// Include dependencies
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);
const moment = require('moment'); // You would need to install this via npm

// Load environment variables
require('dotenv').config();

// Database connection details (these will come from environment variables)
const {
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGHOST,
  PGPORT
} = process.env;

// Create backup filename with timestamp
const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
const backupDir = path.join(__dirname, '../backups');
const backupFilename = `${PGDATABASE}_${timestamp}.sql`;
const backupPath = path.join(backupDir, backupFilename);

// Ensure the backup directory exists
async function ensureBackupDirExists() {
  const dirExists = await existsAsync(backupDir);
  if (!dirExists) {
    await mkdirAsync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);
  }
}

// Create the database backup
async function createBackup() {
  try {
    await ensureBackupDirExists();
    
    console.log(`Creating backup of ${PGDATABASE} database to ${backupPath}...`);
    
    // Construct pg_dump command
    const dumpCmd = `PGPASSWORD=${PGPASSWORD} pg_dump -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -F p -b -v -f "${backupPath}" ${PGDATABASE}`;
    
    // Execute the backup command
    const { stdout, stderr } = await execAsync(dumpCmd);
    
    if (stderr && !stderr.includes('pg_dump: dumping contents of table')) {
      throw new Error(stderr);
    }
    
    console.log(`Backup completed successfully at ${backupPath}`);
    
    // Clean up old backups (keeping last 10)
    await cleanupOldBackups();
    
    return {
      success: true,
      filePath: backupPath,
      timestamp
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Clean up old backups (keep only the latest 10)
async function cleanupOldBackups() {
  try {
    // Get all backup files sorted by modification time (oldest first)
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(PGDATABASE) && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => a.mtime - b.mtime);
    
    // If we have more than 10 backups, remove the oldest ones
    if (files.length > 10) {
      const filesToRemove = files.slice(0, files.length - 10);
      
      for (const file of filesToRemove) {
        fs.unlinkSync(file.path);
        console.log(`Removed old backup: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup of old backups:', error);
  }
}

// If this script is run directly (not imported as a module)
if (require.main === module) {
  createBackup().then(result => {
    if (result.success) {
      console.log('✓ Backup process completed successfully');
    } else {
      console.error('✗ Backup process failed');
      process.exit(1);
    }
  });
}

// Export for use in other scripts
module.exports = {
  createBackup
};