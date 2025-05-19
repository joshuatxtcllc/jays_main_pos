const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript and TypeScript React files in the client/src directory
const findCommand = "find client/src -type f -name \"*.tsx\" -o -name \"*.ts\"";
const files = execSync(findCommand).toString().split('\n').filter(Boolean);

// Regular expression to match imports from 'lucide-react'
const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
const toolRegex = /\bTool\b/;

console.log(`Scanning ${files.length} files for lucide-react imports...`);

let foundToolImport = false;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(importRegex);
    
    if (matches) {
      matches.forEach(match => {
        if (toolRegex.test(match)) {
          console.log(`Found problematic import in file: ${file}`);
          console.log(`Import statement: ${match}`);
          foundToolImport = true;
        }
      });
    }
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
  }
});

if (!foundToolImport) {
  console.log('No direct Tool imports found from lucide-react.');
}