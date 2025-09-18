/**
 * cacheManager.ts
 * 
 * Utility to handle intelligent cache management in Realaist.
 * Works together with sw.js to provide consistent cache behavior.
 */

import { CACHE_NAMES, CACHE_DURATIONS, type CacheType } from './cacheConstants';

export { CACHE_DURATIONS, type CacheType };

function getCacheName(type: CacheType): string {
  switch (type) {
    case 'static': return CACHE_NAMES.STATIC;
    case 'dynamic': return CACHE_NAMES.DYNAMIC;
    case 'api': return CACHE_NAMES.API;
    case 'images': return CACHE_NAMES.IMAGES;
    default: return CACHE_NAMES.DYNAMIC;
  }
}

/**
 * Save a response in cache with a timestamp.
 */
export async function setCache(
  type: CacheType,
  request: RequestInfo,
  response: Response
): Promise<void> {
  try {
    const cache = await caches.open(getCacheName(type));

    // Clone the response body so we can wrap it with metadata
    const body = await response.clone().arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('sw-cache-time', Date.now().toString());

    const wrappedResponse = new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

    await cache.put(request, wrappedResponse);
  } catch (error) {
    console.error(`❌ CacheManager: Failed to set cache for ${type}`, error);
  }
}

/**
 * Get a cached response if it's still fresh.
 */
export async function getCache(
  type: CacheType,
  request: RequestInfo,
  duration: number
): Promise<Response | null> {
  try {
    const cache = await caches.open(getCacheName(type));
    const response = await cache.match(request);

    if (!response) return null;

    const cacheTime = response.headers.get('sw-cache-time');
    if (!cacheTime) return null;

    const age = Date.now() - parseInt(cacheTime, 10);
    if (age > duration) {
      // Cache expired
      await cache.delete(request);
      return null;
    }

    return response.clone();
  } catch (error) {
    console.error(`❌ CacheManager: Failed to get cache for ${type}`, error);
    return null;
  }
}

/**
 * Clear all caches of a given type.
 */
export async function clearCache(type: CacheType): Promise<void> {
  try {
    await caches.delete(getCacheName(type));
    console.log(`🧹 CacheManager: Cleared ${type} cache`);
  } catch (error) {
    console.error(`❌ CacheManager: Failed to clear ${type} cache`, error);
  }
}

/**
 * Clear ALL caches.
 */
export async function clearAllCaches(): Promise<void> {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    console.log('🧹 CacheManager: Cleared all caches');
  } catch (error) {
    console.error('❌ CacheManager: Failed to clear all caches', error);
  }
}

/**
 * Force refresh the page
 */
export function forceRefresh(): void {
  window.location.reload();
}

/**
 * Get cache information
 */
export function getCacheInfo(): { version: string; lastCleared: string; size: number } {
  return {
    version: '3.0.2',
    lastCleared: new Date().toLocaleString(),
    size: 0 // Service worker cache size is not easily accessible
  };
}

// Export a cacheManager object for backward compatibility
export const cacheManager = {
  clearAllCaches,
  forceRefresh,
  getCacheInfo
};
