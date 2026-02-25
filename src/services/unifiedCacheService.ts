/**
 * Unified Cache Service for Realaist
 * 
 * This service consolidates all caching functionality into a single, consistent system.
 * It replaces the multiple conflicting cache systems with one unified approach.
 */

import { CACHE_NAMES, CACHE_DURATIONS, CACHE_KEYS } from '../utils/cacheConstants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface CacheOptions {
  ttl?: number;
  maxAge?: number;
  forceRefresh?: boolean;
  version?: string;
}

class UnifiedCacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CACHE_VERSION = '3.0.3';

  /**
   * Get cached data or fetch from network
   */
  async get<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const { 
      ttl = this.DEFAULT_TTL, 
      maxAge = this.DEFAULT_MAX_AGE, 
      forceRefresh = false,
      version = this.CACHE_VERSION
    } = options;
    
    // Check if we have valid cached data
    if (!forceRefresh) {
      const cached = this.getCached<T>(key, maxAge, version);
      if (cached) {
        console.log(`📦 UnifiedCache: Using cached data for ${key}`);
        return cached;
      }
    }

    // Fetch fresh data
    console.log(`🌐 UnifiedCache: Fetching fresh data for ${key}`);
    try {
      const data = await fetchFn();
      this.setCached(key, data, ttl, version);
      return data;
    } catch (error) {
      // If network fails, try to return stale data
      const stale = this.getCached<T>(key, maxAge * 2, version); // Allow stale data for longer
      if (stale) {
        console.log(`⚠️ UnifiedCache: Using stale data for ${key} due to network error`);
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string, maxAge: number, version: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    const isTooOld = now - entry.timestamp > maxAge;
    const isWrongVersion = entry.version !== version;
    
    // Check if data is stale (older than half the maxAge)
    const isStale = now - entry.timestamp > (maxAge / 2);

    if (isExpired || isTooOld || isWrongVersion) {
      this.memoryCache.delete(key);
      return null;
    }

    // If data is stale, mark it for refresh but still return it
    if (isStale) {
      console.log(`⚠️ UnifiedCache: Data for ${key} is stale, will refresh on next access`);
    }

    return entry.data;
  }

  /**
   * Set cached data with TTL and version
   */
  private setCached<T>(key: string, data: T, ttl: number, version: string): void {
    const now = Date.now();
    this.memoryCache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      version
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.memoryCache.delete(key);
    console.log(`🗑️ UnifiedCache: Cleared cache for ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.memoryCache.clear();
    console.log('🗑️ UnifiedCache: Cleared all cache entries');
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🗑️ UnifiedCache: Cleared ${cleared} expired entries`);
    }
  }

  /**
   * Clear cache by pattern
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let cleared = 0;
    
    for (const [key] of this.memoryCache.entries()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }
    
    console.log(`🗑️ UnifiedCache: Cleared ${cleared} entries matching pattern: ${pattern}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[]; memoryUsage: number } {
    const entries = Array.from(this.memoryCache.keys());
    const memoryUsage = JSON.stringify(Array.from(this.memoryCache.values())).length;
    
    return {
      size: this.memoryCache.size,
      entries,
      memoryUsage
    };
  }

  /**
   * Preload data into cache
   */
  async preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fetchFn();
      this.setCached(key, data, ttl || this.DEFAULT_TTL, this.CACHE_VERSION);
      console.log(`📦 UnifiedCache: Preloaded data for ${key}`);
    } catch (error) {
      console.error(`❌ UnifiedCache: Failed to preload ${key}:`, error);
    }
  }

  /**
   * Clear all property-related caches
   */
  clearPropertyCaches(): void {
    this.clearPattern('^properties-');
    this.clearPattern('^property-');
    console.log('🧹 UnifiedCache: Cleared all property caches');
  }

  /**
   * Clear all user-related caches
   */
  clearUserCaches(): void {
    this.clearPattern('^user-');
    this.clearPattern('^auth-');
    this.clearPattern('^profile-');
    console.log('🧹 UnifiedCache: Cleared all user caches');
  }

  /**
   * Force refresh stale data
   */
  async refreshStaleData<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, version = this.CACHE_VERSION } = options;
    
    console.log(`🔄 UnifiedCache: Force refreshing stale data for ${key}`);
    const data = await fetchFn();
    this.setCached(key, data, ttl, version);
    return data;
  }

  /**
   * Check if data is stale and needs refresh
   */
  isStale(key: string, maxAge: number = this.DEFAULT_MAX_AGE): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return true;
    
    const now = Date.now();
    return now - entry.timestamp > (maxAge / 2);
  }

  /**
   * Get cache entry info
   */
  getCacheInfo(key: string): { exists: boolean; isStale: boolean; age: number; expiresAt: number } | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    return {
      exists: true,
      isStale: now - entry.timestamp > (this.DEFAULT_MAX_AGE / 2),
      age: now - entry.timestamp,
      expiresAt: entry.expiresAt
    };
  }
}

// Export singleton instance
export const unifiedCacheService = new UnifiedCacheService();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  unifiedCacheService.clearExpired();
}, 5 * 60 * 1000);

// Export the class for testing
export { UnifiedCacheService };
