#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const MAX_BUNDLE_SIZE = 50 * 1024; // 50KB max for Obsidian plugins
const REQUIRED_FILES = ['main.js', 'manifest.json'];
const WARNING_SIZE = 30 * 1024; // 30KB warning threshold

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Get file size in bytes
function getFileSize(filePath) {
  if (!fileExists(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Main verification function
function verifyBuild() {
  colorLog('cyan', '\n🔍 The Scripture Injector - Build Verification');
  colorLog('cyan', '==========================================\n');
  
  let allChecksPassed = true;
  
  // Check required files
  colorLog('blue', '📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    if (fileExists(file)) {
      colorLog('green', `  ✓ ${file} exists`);
    } else {
      colorLog('red', `  ✗ ${file} is missing`);
      allChecksPassed = false;
    }
  }
  
  // Check bundle size
  colorLog('blue', '\n📊 Analyzing bundle size...');
  const bundleSize = getFileSize('main.js');
  const bundleSizeFormatted = formatBytes(bundleSize);
  
  if (bundleSize > MAX_BUNDLE_SIZE) {
    colorLog('red', `  ✗ Bundle size ${bundleSizeFormatted} exceeds maximum ${formatBytes(MAX_BUNDLE_SIZE)}`);
    allChecksPassed = false;
  } else if (bundleSize > WARNING_SIZE) {
    colorLog('yellow', `  ⚠ Bundle size ${bundleSizeFormatted} is larger than recommended ${formatBytes(WARNING_SIZE)}`);
  } else {
    colorLog('green', `  ✓ Bundle size ${bundleSizeFormatted} is within acceptable limits`);
  }
  
  // Check manifest.json
  colorLog('blue', '\n📋 Validating manifest.json...');
  if (fileExists('manifest.json')) {
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      
      // Check required fields
      const requiredFields = ['id', 'name', 'version', 'minAppVersion'];
      for (const field of requiredFields) {
        if (manifest[field]) {
          colorLog('green', `  ✓ ${field}: ${manifest[field]}`);
        } else {
          colorLog('red', `  ✗ Missing required field: ${field}`);
          allChecksPassed = false;
        }
      }
      
      // Check minAppVersion compatibility
      const minVersion = manifest.minAppVersion;
      if (minVersion && minVersion >= '0.15.0') {
        colorLog('green', `  ✓ Compatible with Obsidian ${minVersion}+`);
      } else {
        colorLog('yellow', `  ⚠ May not be compatible with newer Obsidian versions`);
      }
      
    } catch (err) {
      colorLog('red', `  ✗ Error parsing manifest.json: ${err.message}`);
      allChecksPassed = false;
    }
  }
  
  // Check for console.log statements in production build
  colorLog('blue', '\n🔍 Checking for debug statements...');
  if (fileExists('main.js')) {
    const bundleContent = fs.readFileSync('main.js', 'utf8');
    if (bundleContent.includes('console.log')) {
      colorLog('yellow', '  ⚠ Production bundle contains console.log statements');
    } else {
      colorLog('green', '  ✓ No console.log statements found in production bundle');
    }
  }
  
  // Summary
  colorLog('cyan', '\n📋 Verification Summary');
  colorLog('cyan', '=====================');
  
  if (allChecksPassed) {
    colorLog('green', '\n✅ All checks passed! The build is ready for production.');
    process.exit(0);
  } else {
    colorLog('red', '\n❌ Some checks failed. Please address the issues above.');
    process.exit(1);
  }
}

// Run verification
verifyBuild();