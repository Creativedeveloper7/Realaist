/**
 * Cache Invalidation Utility
 * 
 * This utility helps manage cache invalidation across the application
 * to ensure users always get the latest version without manual cache clearing.
 */

// Cache version for this build
export const CACHE_VERSION = '3.0.0';

// Check if we need to invalidate cache
export const shouldInvalidateCache = (): boolean => {
  const storedVersion = localStorage.getItem('app_cache_version');
  return storedVersion !== CACHE_VERSION;
};

// Invalidate all caches
export const invalidateAllCaches = async (): Promise<void> => {
  try {
    // Clear localStorage cache
    localStorage.removeItem('app_cache_version');
    localStorage.removeItem('current_user');
    localStorage.removeItem('offline_mode');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }
    
    // Set new cache version
    localStorage.setItem('app_cache_version', CACHE_VERSION);
    
    console.log('✅ Cache invalidation complete');
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
  }
};

// Force reload with cache invalidation
export const forceReloadWithCacheInvalidation = async (): Promise<void> => {
  await invalidateAllCaches();
  window.location.reload();
};

// Initialize cache version check
export const initializeCacheVersion = (): void => {
  if (shouldInvalidateCache()) {
    console.log('🔄 New app version detected, invalidating cache...');
    invalidateAllCaches();
  } else {
    localStorage.setItem('app_cache_version', CACHE_VERSION);
  }
};

// Check for updates and invalidate if needed
export const checkForUpdates = async (): Promise<void> => {
  if (shouldInvalidateCache()) {
    console.log('🔄 App update detected, clearing cache...');
    await invalidateAllCaches();
    window.location.reload();
  }
};
