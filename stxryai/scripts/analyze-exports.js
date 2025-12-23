#!/usr/bin/env node

/**
 * Export Analyzer Script
 * 
 * Analyzes barrel files (index.ts) to identify:
 * - Unused exports
 * - Re-export chains
 * - Optimization opportunities for tree shaking
 * 
 * Usage: node scripts/analyze-exports.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const IGNORE_DIRS = ['node_modules', '.next', 'dist', '__tests__'];

// Track all exports and imports
const exports = new Map(); // file -> Set<exportName>
const imports = new Map(); // file -> Map<importedFrom, Set<importNames>>

/**
 * Find all TypeScript/JavaScript files
 */
function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        findFiles(fullPath, files);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract exports from a file
 */
function extractExports(content, filePath) {
  const fileExports = new Set();
  
  // Named exports: export const/let/var/function/class NAME
  const namedExportRegex = /export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    fileExports.add(match[2]);
  }
  
  // Export { name1, name2 }
  const exportBracesRegex = /export\s*\{([^}]+)\}/g;
  while ((match = exportBracesRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/).pop().trim());
    names.forEach(n => n && fileExports.add(n));
  }
  
  // Default export
  if (/export\s+default/.test(content)) {
    fileExports.add('default');
  }
  
  // Re-exports: export { x } from './y' or export * from './y'
  const reExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    fileExports.add(`* from ${match[1]}`);
  }
  
  exports.set(filePath, fileExports);
  return fileExports;
}

/**
 * Extract imports from a file
 */
function extractImports(content, filePath) {
  const fileImports = new Map();
  
  // import { a, b } from 'module'
  // import X from 'module'
  // import * as Y from 'module'
  const importRegex = /import\s+(?:(\w+)|(?:\{([^}]+)\})|(?:\*\s+as\s+(\w+)))\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const modulePath = match[4];
    const importNames = new Set();
    
    if (match[1]) { // default import
      importNames.add('default');
    }
    if (match[2]) { // named imports
      match[2].split(',').forEach(n => {
        const name = n.trim().split(/\s+as\s+/)[0].trim();
        if (name) importNames.add(name);
      });
    }
    if (match[3]) { // namespace import
      importNames.add('*');
    }
    
    if (!fileImports.has(modulePath)) {
      fileImports.set(modulePath, new Set());
    }
    importNames.forEach(n => fileImports.get(modulePath).add(n));
  }
  
  imports.set(filePath, fileImports);
  return fileImports;
}

/**
 * Find barrel files (index.ts)
 */
function findBarrelFiles(files) {
  return files.filter(f => /index\.(ts|tsx|js|jsx)$/.test(f));
}

/**
 * Analyze a barrel file for optimization opportunities
 */
function analyzeBarrel(barrelPath, allFiles) {
  const content = fs.readFileSync(barrelPath, 'utf-8');
  const barrelExports = extractExports(content, barrelPath);
  
  // Count how many times each export is imported
  const importCounts = new Map();
  barrelExports.forEach(exp => importCounts.set(exp, 0));
  
  // Check if exports are used anywhere
  const barrelDir = path.dirname(barrelPath);
  const barrelModule = barrelDir.replace(SRC_DIR, '@').replace(/\\/g, '/');
  
  allFiles.forEach(file => {
    if (file === barrelPath) return;
    
    const fileImports = imports.get(file);
    if (!fileImports) return;
    
    fileImports.forEach((names, module) => {
      // Check if this import refers to our barrel
      if (module === barrelModule || module.endsWith('/index')) {
        names.forEach(name => {
          if (importCounts.has(name)) {
            importCounts.set(name, importCounts.get(name) + 1);
          }
        });
      }
    });
  });
  
  return {
    path: barrelPath,
    exports: barrelExports,
    importCounts,
    unusedExports: [...importCounts.entries()].filter(([_, count]) => count === 0).map(([name]) => name),
  };
}

/**
 * Main analysis
 */
function analyze() {
  console.log('🔍 Analyzing exports in', SRC_DIR, '\n');
  
  const files = findFiles(SRC_DIR);
  console.log(`Found ${files.length} files\n`);
  
  // Extract all exports and imports
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    extractExports(content, file);
    extractImports(content, file);
  });
  
  // Find and analyze barrel files
  const barrelFiles = findBarrelFiles(files);
  console.log(`Found ${barrelFiles.length} barrel files (index.ts)\n`);
  
  const issues = [];
  
  barrelFiles.forEach(barrelPath => {
    const analysis = analyzeBarrel(barrelPath, files);
    
    if (analysis.unusedExports.length > 0) {
      issues.push({
        type: 'unused',
        file: barrelPath.replace(SRC_DIR, 'src'),
        exports: analysis.unusedExports,
      });
    }
  });
  
  // Report findings
  console.log('📊 Analysis Results\n');
  console.log('═'.repeat(60));
  
  if (issues.length === 0) {
    console.log('\n✅ No obvious issues found!\n');
  } else {
    console.log(`\n⚠️  Found ${issues.length} files with potential unused exports:\n`);
    
    issues.forEach(issue => {
      console.log(`📁 ${issue.file}`);
      console.log(`   Potentially unused: ${issue.exports.join(', ')}`);
      console.log('');
    });
  }
  
  // Recommendations
  console.log('\n📝 Recommendations for Tree Shaking Optimization:\n');
  console.log('1. Prefer named exports over default exports');
  console.log('2. Avoid re-exporting entire modules (export * from)');
  console.log('3. Use direct imports instead of barrel imports for large modules');
  console.log('4. Add /* @__PURE__ */ annotations for pure function calls');
  console.log('5. Ensure sideEffects: false in package.json for pure modules\n');
  
  // Check for sideEffects configuration
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (!packageJson.sideEffects) {
    console.log('⚠️  Consider adding "sideEffects": false to package.json for better tree shaking\n');
  }
}

analyze();

