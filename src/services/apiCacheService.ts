/**
 * API Cache Service for Realaist
 * 
 * Provides intelligent caching for API responses to improve performance
 * and reduce unnecessary network requests.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number; // Maximum age in milliseconds
  forceRefresh?: boolean; // Force refresh from network
}

class ApiCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get cached data or fetch from network
   */
  async get<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, maxAge = this.DEFAULT_MAX_AGE, forceRefresh = false } = options;
    
    // Check if we have valid cached data
    if (!forceRefresh) {
      const cached = this.getCached<T>(key, maxAge);
      if (cached) {
        console.log(`📦 API Cache: Using cached data for ${key}`);
        return cached;
      }
    }

    // Fetch fresh data
    console.log(`🌐 API Cache: Fetching fresh data for ${key}`);
    try {
      const data = await fetchFn();
      this.setCached(key, data, ttl);
      return data;
    } catch (error) {
      // If network fails, try to return stale data
      const stale = this.getCached<T>(key, maxAge * 2); // Allow stale data for longer
      if (stale) {
        console.log(`⚠️ API Cache: Using stale data for ${key} due to network error`);
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached<T>(key: string, maxAge: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    const isTooOld = now - entry.timestamp > maxAge;

    if (isExpired || isTooOld) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data with TTL
   */
  private setCached<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ API Cache: Cleared cache for ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    console.log('🗑️ API Cache: Cleared all cache entries');
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🗑️ API Cache: Cleared ${cleared} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Preload data into cache
   */
  async preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fetchFn();
      this.setCached(key, data, ttl || this.DEFAULT_TTL);
      console.log(`📦 API Cache: Preloaded data for ${key}`);
    } catch (error) {
      console.error(`❌ API Cache: Failed to preload ${key}:`, error);
    }
  }
}

// Export singleton instance
export const apiCacheService = new ApiCacheService();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  apiCacheService.clearExpired();
}, 5 * 60 * 1000);
