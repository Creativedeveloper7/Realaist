/**
 * Cache Invalidation Utility
 *
 * Ensures users always get the latest app version
 * without manual cache clearing.
 *
 * ⚡ API/data expiration is handled in cacheManager.ts
 * This file only handles APP version updates.
 */

import { CACHE_VERSION } from './cacheConstants';

// Check if we need to invalidate cache
export const shouldInvalidateCache = (): boolean => {
  const storedVersion = localStorage.getItem('app_cache_version');
  return storedVersion !== CACHE_VERSION;
};

// Invalidate app caches & storage (but keep SW registered)
export const invalidateAllCaches = async (): Promise<void> => {
  try {
    // Clear storage
    localStorage.removeItem('app_cache_version');
    localStorage.removeItem('current_user');
    localStorage.removeItem('offline_mode');
    sessionStorage.clear();

    // Clear SW caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }

    // Update version in storage
    localStorage.setItem('app_cache_version', CACHE_VERSION);

    console.log('✅ Cache invalidation complete');
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
  }
};

// Force reload + cache invalidation
export const forceReloadWithCacheInvalidation = async (): Promise<void> => {
  await invalidateAllCaches();
  window.location.reload();
};

// Initialize cache version check (call once at startup)
export const initializeCacheVersion = (): void => {
  if (shouldInvalidateCache()) {
    console.log('🔄 New app version detected, clearing cache...');
    invalidateAllCaches().then(() => window.location.reload());
  } else {
    localStorage.setItem('app_cache_version', CACHE_VERSION);
  }
};

// Check server manifest.json for updates
export const checkForUpdates = async (): Promise<void> => {
  try {
    const response = await fetch('/manifest.json', { cache: 'no-store' });
    if (!response.ok) return;

    const manifest = await response.json();
    const currentVersion = manifest.version || CACHE_VERSION;

    if (currentVersion !== CACHE_VERSION) {
      console.log('🔄 App update detected via manifest.json, clearing cache...');
      await invalidateAllCaches();
      window.location.reload();
    }
  } catch (error) {
    console.warn('⚠️ Update check failed:', error);
  }
};
