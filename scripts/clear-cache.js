#!/usr/bin/env node

/**
 * Cache Clearing Utility for Realaist Website
 * 
 * Features:
 * 1. Clear build cache
 * 2. Clear npm cache
 * 3. Clear Vite cache
 * 4. Reinstall dependencies
 * 5. Force Service Worker refresh (bumps version in sw.js)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const viteCachePath = path.join(__dirname, '..', '.vite');
  try {
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
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    log('   ✅ Dependencies reinstalled', 'green');
  } catch (error) {
    log(`   ❌ Failed to reinstall dependencies: ${error.message}`, 'red');
  }
}

/**
 * Force Service Worker refresh
 * Bumps the CACHE_NAME version in sw.js
 */
function bumpServiceWorkerVersion() {
  log('🔄 Bumping Service Worker version...', 'yellow');
  const swPath = path.join(__dirname, '..', 'public', 'sw.js'); // adjust if sw.js is elsewhere

  if (!fs.existsSync(swPath)) {
    log('   ❌ sw.js not found in public/', 'red');
    return;
  }

  try {
    let content = fs.readFileSync(swPath, 'utf8');
    const versionMatch = content.match(/realaist-cache-v(\d+)/);

    if (versionMatch) {
      const currentVersion = parseInt(versionMatch[1], 10);
      const newVersion = currentVersion + 1;
      content = content.replace(
        /realaist-cache-v\d+/,
        `realaist-cache-v${newVersion}`
      );
      fs.writeFileSync(swPath, content, 'utf8');
      log(`   ✅ Service Worker version bumped to v${newVersion}`, 'green');
    } else {
      log('   ❌ No CACHE_NAME found to bump', 'red');
    }
  } catch (error) {
    log(`   ❌ Failed to update sw.js: ${error.message}`, 'red');
  }
}

function showHelp() {
  log('\n🚀 Realaist Cache Clearing Utility', 'cyan');
  log('=====================================\n', 'cyan');
  log('Usage: node scripts/clear-cache.js [options]\n', 'bright');
  log('Options:', 'yellow');
  log('  --build          Clear build cache (dist, .vite, etc.)', 'reset');
  log('  --npm            Clear npm cache', 'reset');
  log('  --vite           Clear Vite cache', 'reset');
  log('  --deps           Reinstall dependencies', 'reset');
  log('  --sw             Force Service Worker refresh (bump version)', 'reset');
  log('  --all            Clear all caches', 'reset');
  log('  --help           Show this help message', 'reset');
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
    bumpServiceWorkerVersion();
    log('\n✅ All caches cleared!', 'green');
  } else {
    if (args.includes('--build')) clearBuildCache();
    if (args.includes('--npm')) clearNodeModulesCache();
    if (args.includes('--vite')) clearViteCache();
    if (args.includes('--deps')) reinstallDependencies();
    if (args.includes('--sw')) bumpServiceWorkerVersion();
  }

  log('\n🎉 Cache clearing complete!', 'green');
  log('💡 Redeploy your site to push the new Service Worker version.', 'cyan');
}

main();
