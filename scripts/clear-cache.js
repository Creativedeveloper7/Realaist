#!/usr/bin/env node

/**
 * Cache Clearing Utility for Realaist Website
 * 
 * This script provides multiple cache clearing options:
 * 1. Clear browser cache (via service worker)
 * 2. Clear build cache
 * 3. Clear node_modules cache
 * 4. Clear Vite cache
 * 5. Force browser refresh
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function clearBuildCache() {
  log('🗑️  Clearing build cache...', 'yellow');
  
  const buildDirs = ['dist', 'build', '.vite', 'node_modules/.vite'];
  
  buildDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`   ✅ Cleared ${dir}`, 'green');
      } catch (error) {
        log(`   ❌ Failed to clear ${dir}: ${error.message}`, 'red');
      }
    }
  });
}

function clearNodeModulesCache() {
  log('🗑️  Clearing node_modules cache...', 'yellow');
  
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    log('   ✅ npm cache cleared', 'green');
  } catch (error) {
    log(`   ❌ Failed to clear npm cache: ${error.message}`, 'red');
  }
}

function clearViteCache() {
  log('🗑️  Clearing Vite cache...', 'yellow');
  
  try {
    // Vite doesn't have a --clearCache flag, so we manually clear the .vite directory
    const viteCachePath = path.join(__dirname, '..', '.vite');
    if (fs.existsSync(viteCachePath)) {
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      log('   ✅ Vite cache cleared', 'green');
    } else {
      log('   ℹ️  No Vite cache found', 'blue');
    }
  } catch (error) {
    log(`   ❌ Failed to clear Vite cache: ${error.message}`, 'red');
  }
}

function reinstallDependencies() {
  log('📦 Reinstalling dependencies...', 'yellow');
  
  try {
    // Remove node_modules and package-lock.json
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
    const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
    
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      log('   ✅ Removed node_modules', 'green');
    }
    
    if (fs.existsSync(packageLockPath)) {
      fs.rmSync(packageLockPath, { force: true });
      log('   ✅ Removed package-lock.json', 'green');
    }
    
    // Reinstall
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    log('   ✅ Dependencies reinstalled', 'green');
  } catch (error) {
    log(`   ❌ Failed to reinstall dependencies: ${error.message}`, 'red');
  }
}

function showHelp() {
  log('\n🚀 Realaist Cache Clearing Utility', 'cyan');
  log('=====================================\n', 'cyan');
  
  log('Usage: node scripts/clear-cache.js [options]\n', 'bright');
  
  log('Options:', 'yellow');
  log('  --build        Clear build cache (dist, .vite, etc.)', 'reset');
  log('  --npm          Clear npm cache', 'reset');
  log('  --vite         Clear Vite cache', 'reset');
  log('  --deps         Reinstall dependencies (nuclear option)', 'reset');
  log('  --all          Clear all caches (recommended)', 'reset');
  log('  --help         Show this help message', 'reset');
  
  log('\nExamples:', 'yellow');
  log('  node scripts/clear-cache.js --all', 'reset');
  log('  node scripts/clear-cache.js --build --vite', 'reset');
  log('  npm run clear-cache', 'reset');
  
  log('\n💡 Tip: Use "npm run clear-cache" for the quickest cache clear!', 'magenta');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  log('🧹 Starting cache clearing process...\n', 'bright');
  
  if (args.includes('--all')) {
    clearBuildCache();
    clearNodeModulesCache();
    clearViteCache();
    log('\n✅ All caches cleared!', 'green');
  } else {
    if (args.includes('--build')) clearBuildCache();
    if (args.includes('--npm')) clearNodeModulesCache();
    if (args.includes('--vite')) clearViteCache();
    if (args.includes('--deps')) reinstallDependencies();
  }
  
  log('\n🎉 Cache clearing complete!', 'green');
  log('💡 Try refreshing your browser or restarting the dev server.', 'cyan');
}

main();
