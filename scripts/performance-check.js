/**
 * Performance Check and Optimization Script for Jays Frames POS System
 * 
 * This script analyzes the application performance and suggests optimizations.
 * It checks database queries, API response times, and frontend load times.
 */

const { performance } = require('perf_hooks');
const axios = require('axios');
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

// Load environment variables
require('dotenv').config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define endpoints to test
const ENDPOINTS = [
  { url: '/api/frames', method: 'GET', name: 'Get All Frames' },
  { url: '/api/mat-colors', method: 'GET', name: 'Get All Mat Colors' },
  { url: '/api/glass-options', method: 'GET', name: 'Get All Glass Options' },
  { url: '/api/special-services', method: 'GET', name: 'Get All Special Services' },
  { url: '/api/customers', method: 'GET', name: 'Get All Customers' },
  { url: '/api/orders', method: 'GET', name: 'Get All Orders' },
  { url: '/api/material-orders', method: 'GET', name: 'Get All Material Orders' },
  { url: '/api/production/kanban', method: 'GET', name: 'Get Kanban Data' },
];

// Define slow query threshold (in ms)
const SLOW_QUERY_THRESHOLD = 500;
const VERY_SLOW_QUERY_THRESHOLD = 1000;

// Define slow API response threshold (in ms)
const SLOW_API_THRESHOLD = 300;
const VERY_SLOW_API_THRESHOLD = 1000;

/**
 * Format time to a readable string
 */
function formatTime(timeMs) {
  if (timeMs < 1) {
    return `${(timeMs * 1000).toFixed(2)}μs`;
  } else if (timeMs < 1000) {
    return `${timeMs.toFixed(2)}ms`;
  } else {
    return `${(timeMs / 1000).toFixed(2)}s`;
  }
}

/**
 * Check for slow database queries
 */
async function checkDatabasePerformance() {
  console.log('\n--- Database Performance Check ---');
  console.log('Analyzing database queries...\n');
  
  try {
    // Get list of tables
    const tableQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = tableQuery.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables to analyze`);
    
    // Check counts for each table
    for (const table of tables) {
      const startTime = performance.now();
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
      const endTime = performance.now();
      const duration = endTime - startTime;

      const count = parseInt(countResult.rows[0].count, 10);
      
      let status = 'OK';
      if (duration > SLOW_QUERY_THRESHOLD) {
        status = duration > VERY_SLOW_QUERY_THRESHOLD ? 'VERY SLOW' : 'SLOW';
      }
      
      const padding = 30 - table.length;
      console.log(`${table}${' '.repeat(padding > 0 ? padding : 2)}| ${count.toString().padStart(6)} records | ${formatTime(duration).padStart(10)} | ${status}`);
      
      if (status !== 'OK') {
        console.log(`  Suggestion: Consider adding indexes to table '${table}'`);
        // Check if table has indexes
        const indexQuery = await pool.query(`
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE tablename = $1
        `, [table]);
        
        if (indexQuery.rows.length === 0) {
          console.log(`  Warning: No indexes found on table '${table}'`);
        } else {
          console.log(`  Current indexes on '${table}':`);
          indexQuery.rows.forEach(row => {
            console.log(`    - ${row.indexname}: ${row.indexdef}`);
          });
        }
      }
    }
    
    // Check for missing indexes on common query patterns
    console.log('\nChecking for commonly needed indexes...');
    
    // Foreign key columns should typically be indexed
    const fkQuery = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    `);
    
    if (fkQuery.rows.length > 0) {
      console.log('\nForeign key columns that should be indexed:');
      for (const row of fkQuery.rows) {
        // Check if this column already has an index
        const indexCheck = await pool.query(`
          SELECT 1
          FROM pg_indexes
          WHERE tablename = $1
            AND indexdef LIKE '%' || $2 || '%'
        `, [row.table_name, row.column_name]);
        
        if (indexCheck.rows.length === 0) {
          console.log(`  - Table '${row.table_name}': Add index on column '${row.column_name}'`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking database performance:', error);
  }
}

/**
 * Test API endpoint performance
 */
async function checkAPIPerformance(baseUrl = 'http://localhost:5000') {
  console.log('\n--- API Performance Check ---');
  console.log('Testing API endpoint response times...\n');
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    try {
      const url = `${baseUrl}${endpoint.url}`;
      const startTime = performance.now();
      const response = await axios({
        method: endpoint.method,
        url,
        timeout: 10000, // 10 second timeout
      });
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      let status = 'OK';
      if (duration > SLOW_API_THRESHOLD) {
        status = duration > VERY_SLOW_API_THRESHOLD ? 'VERY SLOW' : 'SLOW';
      }
      
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        status: response.status,
        duration,
        responseSize: JSON.stringify(response.data).length,
        performanceStatus: status
      };
      
      results.push(result);
      
      const padding = 25 - endpoint.name.length;
      console.log(`${endpoint.name}${' '.repeat(padding > 0 ? padding : 2)}| ${formatTime(duration).padStart(10)} | ${status.padEnd(8)} | ${response.status} | Size: ${(result.responseSize / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error(`Error testing ${endpoint.url}:`, error.message);
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        status: error.response?.status || 'ERROR',
        duration: 0,
        error: error.message,
        performanceStatus: 'ERROR'
      });
    }
  }
  
  console.log('\nAnalysis and Recommendations:');
  const slowEndpoints = results.filter(r => r.performanceStatus !== 'OK' && r.performanceStatus !== 'ERROR');
  
  if (slowEndpoints.length === 0) {
    console.log('✓ All API endpoints are performing within acceptable parameters');
  } else {
    console.log(`Found ${slowEndpoints.length} slow API endpoints that need optimization:`);
    slowEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint.name} (${endpoint.url}): ${formatTime(endpoint.duration)}`);
      
      if (endpoint.responseSize > 100000) {
        console.log(`    Suggestion: Response size is large (${(endpoint.responseSize / 1024).toFixed(2)} KB). Consider pagination or reducing payload size.`);
      }
      
      if (endpoint.url.includes('frames') || endpoint.url.includes('mat-colors')) {
        console.log('    Suggestion: Consider implementing caching for catalog data that rarely changes');
      }
      
      console.log('    Suggestion: Add database indexes for frequently queried fields');
    });
  }
  
  return results;
}

/**
 * Scan frontend code for performance issues
 */
async function scanFrontendCode() {
  console.log('\n--- Frontend Code Scan ---');
  console.log('Scanning frontend code for potential performance issues...\n');
  
  const clientDir = path.join(__dirname, '../client');
  
  // Check if client directory exists
  if (!fs.existsSync(clientDir)) {
    console.error('Client directory not found!');
    return;
  }
  
  // List of patterns to look for
  const patterns = [
    { 
      regex: /useEffect\(\s*\(\)\s*=>\s*{\s*.*\s*},\s*\[\]\s*\)/gs, 
      issue: 'Empty dependency array in useEffect - this is fine for initialization but make sure it\'s intentional'
    },
    { 
      regex: /new\s+Array\(/g, 
      issue: 'Using array constructor instead of array literal []'
    },
    { 
      regex: /new\s+Object\(/g, 
      issue: 'Using object constructor instead of object literal {}'
    },
    { 
      regex: /\.map\(.*\.map\(/gs, 
      issue: 'Nested .map() calls - consider refactoring to improve performance'
    },
    { 
      regex: /useState\([^)]*new\s+[A-Z]/g, 
      issue: 'Creating objects in useState initial value - consider moving outside the component'
    },
    { 
      regex: /[^\w]function\s*\(\)\s*{\s*return\s*[^;{]*;\s*}\)/g, 
      issue: 'Simple function that could be replaced with an arrow function'
    },
    { 
      regex: /console\.log/g, 
      issue: 'Console.log statements should be removed in production'
    },
    { 
      regex: /setTimeout\s*\(\s*\(\)\s*=>\s*{[\s\S]*?},\s*0\s*\)/g, 
      issue: 'setTimeout with 0ms delay - consider using requestAnimationFrame instead'
    },
  ];
  
  // Get list of all .ts and .tsx files
  async function getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
  }
  
  const files = await getFiles(clientDir);
  console.log(`Found ${files.length} TypeScript files to scan\n`);
  
  let totalIssues = 0;
  const fileIssues = [];
  
  for (const file of files) {
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    const content = fs.readFileSync(file, 'utf8');
    
    let fileHasIssues = false;
    const issues = [];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        fileHasIssues = true;
        totalIssues += matches.length;
        issues.push({
          pattern: pattern.issue,
          count: matches.length
        });
      }
    }
    
    if (fileHasIssues) {
      fileIssues.push({
        file: relativePath,
        issues
      });
    }
  }
  
  if (fileIssues.length === 0) {
    console.log('✓ No common performance issues found in frontend code');
  } else {
    console.log(`Found ${totalIssues} potential performance issues across ${fileIssues.length} files:`);
    fileIssues.forEach(file => {
      console.log(`  File: ${file.file}`);
      file.issues.forEach(issue => {
        console.log(`    - ${issue.pattern} (${issue.count} occurrences)`);
      });
    });
  }
  
  // Check bundle size if package.json exists
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('\nChecking for large dependencies that could impact bundle size:');
    const packageJson = require(packageJsonPath);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const largePackages = [
      'moment',
      'lodash',
      'jquery',
      'bootstrap',
      'three',
      'material-ui',
      '@material-ui',
      'chart.js',
      'antd',
      '@ant-design',
      'semantic-ui'
    ];
    
    const foundLargePackages = [];
    
    for (const pkg in dependencies) {
      if (largePackages.some(large => pkg === large || pkg.startsWith(large + '/') || pkg.includes(large))) {
        foundLargePackages.push(pkg);
      }
    }
    
    if (foundLargePackages.length > 0) {
      console.log('Large packages that could be optimized:');
      foundLargePackages.forEach(pkg => {
        console.log(`  - ${pkg}: Consider using a lighter alternative or importing only required components`);
        if (pkg === 'moment') {
          console.log('    Suggestion: Replace with date-fns or day.js for smaller bundle size');
        } else if (pkg === 'lodash') {
          console.log('    Suggestion: Import individual lodash functions or use native JavaScript alternatives');
        } else if (pkg === 'three') {
          console.log('    Suggestion: Use dynamic imports to load Three.js only when needed');
        }
      });
    } else {
      console.log('✓ No known large packages that would significantly impact bundle size');
    }
  }
}

/**
 * Main function to run all checks
 */
async function runPerformanceChecks() {
  console.log('=================================================');
  console.log('JAYS FRAMES POS SYSTEM - PERFORMANCE CHECK REPORT');
  console.log('=================================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('=================================================\n');
  
  // Check database performance
  await checkDatabasePerformance();
  
  // Check API performance
  await checkAPIPerformance();
  
  // Scan frontend code
  await scanFrontendCode();
  
  console.log('\n=================================================');
  console.log('PERFORMANCE CHECK COMPLETE');
  console.log('=================================================');
}

// If this script is run directly (not imported as a module)
if (require.main === module) {
  runPerformanceChecks().catch(error => {
    console.error('Error running performance checks:', error);
    process.exit(1);
  });
}

module.exports = {
  checkDatabasePerformance,
  checkAPIPerformance,
  scanFrontendCode,
  runPerformanceChecks
};