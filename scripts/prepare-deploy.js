/**
 * Prepare Deployment Script for Jays Frames POS System
 * 
 * This script performs various checks and preparations for deploying
 * the application to a production environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');
const { promisify } = require('util');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'SENDGRID_API_KEY',
  'OPENAI_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_KEY'
];

// Utility function to check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Utility function to format file size
function formatFileSize(size) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n--- Checking Environment Variables ---');
  
  const missing = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length === 0) {
    console.log('✓ All required environment variables are set');
  } else {
    console.log(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.log('  These must be set in production environment');
  }
  
  // Warn about sensitive values in client-side env vars
  const clientSideEnvVars = Object.keys(process.env).filter(key => key.startsWith('VITE_'));
  const sensitiveClientVars = clientSideEnvVars.filter(key => 
    key.includes('KEY') || 
    key.includes('SECRET') || 
    key.includes('TOKEN') || 
    key.includes('PASSWORD')
  );
  
  if (sensitiveClientVars.length > 0) {
    console.log('\n⚠️ Warning: Potentially sensitive data in client-side environment variables:');
    sensitiveClientVars.forEach(key => {
      console.log(`  - ${key}: Client-side environment variables (VITE_*) are embedded in the frontend build and accessible to users`);
    });
  }
}

// Check for development artifacts that shouldn't be in production
function checkDevelopmentArtifacts() {
  console.log('\n--- Checking for Development Artifacts ---');
  
  // Check for console.log statements
  try {
    const clientDir = path.join(__dirname, '../client');
    const grepResult = execSync(`grep -r "console.log" ${clientDir} --include="*.ts" --include="*.tsx" | wc -l`, { encoding: 'utf8' });
    const logCount = parseInt(grepResult.trim(), 10);
    
    if (logCount > 0) {
      console.log(`⚠️ Warning: Found ${logCount} console.log statements that should be removed in production`);
    } else {
      console.log('✓ No console.log statements found');
    }
  } catch (error) {
    console.log('⚠️ Could not check for console.log statements');
  }
  
  // Check for TODO comments
  try {
    const grepResult = execSync(`grep -r "TODO" . --include="*.ts" --include="*.tsx" --include="*.js" | wc -l`, { encoding: 'utf8' });
    const todoCount = parseInt(grepResult.trim(), 10);
    
    if (todoCount > 0) {
      console.log(`⚠️ Warning: Found ${todoCount} TODO comments that should be addressed before production`);
    } else {
      console.log('✓ No TODO comments found');
    }
  } catch (error) {
    console.log('⚠️ Could not check for TODO comments');
  }
  
  // Check for package.json dev dependencies
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    const devDependencies = packageJson.devDependencies || {};
    const devDepCount = Object.keys(devDependencies).length;
    
    console.log(`ℹ️ Found ${devDepCount} devDependencies in package.json`);
    console.log('  Note: Make sure to install with --production flag in production');
  }
}

// Check database connection and structure
async function checkDatabase() {
  console.log('\n--- Checking Database ---');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set, skipping database checks');
    return;
  }
  
  try {
    // Check if we can connect to the database
    console.log('Checking database connection...');
    execSync(`node -e "const { Pool } = require('@neondatabase/serverless'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT 1').then(() => { console.log('Connection successful'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"`, {
      stdio: 'inherit'
    });
    
    // Check if required tables exist
    console.log('Checking database tables...');
    const essentialTables = [
      'users', 'customers', 'frames', 'mat_colors', 'glass_options', 
      'orders', 'order_groups', 'special_services', 'material_orders'
    ];
    
    for (const table of essentialTables) {
      try {
        execSync(`node -e "const { Pool } = require('@neondatabase/serverless'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT COUNT(*) FROM ${table}').then(() => { process.exit(0); }).catch(err => { process.exit(1); });"`, {
          stdio: 'ignore'
        });
        console.log(`✓ Table '${table}' exists`);
      } catch (error) {
        console.log(`❌ Table '${table}' does not exist or cannot be accessed`);
      }
    }
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log(error.message);
  }
}

// Build the application and analyze the output
async function buildAndAnalyze() {
  console.log('\n--- Building and Analyzing Application ---');
  
  // Check if build command exists in package.json
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log('Building application...');
      try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✓ Build successful');
        
        // Check build output
        const distPath = path.join(__dirname, '../dist');
        if (fs.existsSync(distPath)) {
          // Analyze build files
          console.log('\nAnalyzing build output:');
          
          const files = [];
          function scanDirectory(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              
              if (entry.isDirectory()) {
                scanDirectory(fullPath);
              } else {
                const stats = fs.statSync(fullPath);
                files.push({
                  path: path.relative(distPath, fullPath),
                  size: stats.size,
                  extension: path.extname(entry.name).toLowerCase()
                });
              }
            }
          }
          
          scanDirectory(distPath);
          
          // Sort by size (largest first)
          files.sort((a, b) => b.size - a.size);
          
          // Group by extension
          const extensionSizes = {};
          for (const file of files) {
            if (!extensionSizes[file.extension]) {
              extensionSizes[file.extension] = 0;
            }
            extensionSizes[file.extension] += file.size;
          }
          
          // Output by extension
          console.log('\nSize by file type:');
          const extensions = Object.keys(extensionSizes);
          extensions.sort((a, b) => extensionSizes[b] - extensionSizes[a]);
          
          for (const ext of extensions) {
            console.log(`${ext.padEnd(8)} ${formatFileSize(extensionSizes[ext]).padStart(10)}`);
          }
          
          // Output largest individual files
          console.log('\nLargest files:');
          for (let i = 0; i < Math.min(10, files.length); i++) {
            console.log(`${formatFileSize(files[i].size).padStart(10)} ${files[i].path}`);
          }
          
          // Check for large JS bundles
          const jsFiles = files.filter(f => f.extension === '.js' && f.size > 500 * 1024);
          if (jsFiles.length > 0) {
            console.log('\n⚠️ Warning: Large JavaScript bundles detected:');
            for (const file of jsFiles) {
              console.log(`  - ${file.path} (${formatFileSize(file.size)})`);
            }
            console.log('  Consider code splitting to reduce initial load time');
          }
          
          // Check for uncompressed images
          const imageFiles = files.filter(f => ['.png', '.jpg', '.jpeg', '.gif'].includes(f.extension) && f.size > 200 * 1024);
          if (imageFiles.length > 0) {
            console.log('\n⚠️ Warning: Large image files detected:');
            for (const file of imageFiles) {
              console.log(`  - ${file.path} (${formatFileSize(file.size)})`);
            }
            console.log('  Consider compressing these images or using a responsive image solution');
          }
          
          // Total build size
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          console.log(`\nTotal build size: ${formatFileSize(totalSize)}`);
          
          if (totalSize > 5 * 1024 * 1024) {
            console.log('⚠️ Warning: Build size is quite large, consider optimizing');
          } else {
            console.log('✓ Build size is within reasonable limits');
          }
        } else {
          console.log('❌ Build output directory not found');
        }
      } catch (error) {
        console.log('❌ Build failed');
        console.log(error.message);
      }
    } else {
      console.log('❌ No build script found in package.json');
    }
  } else {
    console.log('❌ package.json not found');
  }
}

// Finalize deployment preparations
function finalizePreparations() {
  console.log('\n--- Deployment Recommendations ---');
  
  console.log('Before deploying to production, ensure you:');
  console.log('1. ☐ Configure a production-grade web server (e.g., Nginx)');
  console.log('2. ☐ Set up HTTPS with a valid SSL certificate');
  console.log('3. ☐ Configure database backups');
  console.log('4. ☐ Set up monitoring and alerts');
  console.log('5. ☐ Deploy using a CI/CD pipeline if possible');
  console.log('6. ☐ Perform a security audit');
  console.log('7. ☐ Test on multiple browsers and devices');
  console.log('8. ☐ Create a rollback plan in case of issues');
  
  console.log('\nProduction environment should have:');
  console.log('• ☐ All required environment variables set');
  console.log('• ☐ NODE_ENV=production');
  console.log('• ☐ Dependencies installed with --production flag');
  console.log('• ☐ Adequate server resources (CPU/memory)');
  console.log('• ☐ Rate limiting and DDoS protection configured');
}

// Main function to run all checks
async function prepareForDeployment() {
  console.log('=================================================');
  console.log('JAYS FRAMES POS SYSTEM - DEPLOYMENT PREPARATION');
  console.log('=================================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('=================================================\n');
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Check for development artifacts
  checkDevelopmentArtifacts();
  
  // Check database
  await checkDatabase();
  
  // Build and analyze
  await buildAndAnalyze();
  
  // Final recommendations
  finalizePreparations();
  
  console.log('\n=================================================');
  console.log('DEPLOYMENT PREPARATION COMPLETE');
  console.log('=================================================');
}

// If this script is run directly (not imported as a module)
if (require.main === module) {
  prepareForDeployment().catch(error => {
    console.error('Error during deployment preparation:', error);
    process.exit(1);
  });
}

module.exports = {
  checkEnvironmentVariables,
  checkDevelopmentArtifacts,
  checkDatabase,
  buildAndAnalyze,
  finalizePreparations,
  prepareForDeployment
};