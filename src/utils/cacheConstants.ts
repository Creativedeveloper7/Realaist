/**
 * Cache Constants - Single Source of Truth
 * 
 * This file contains all cache-related constants to prevent version conflicts
 * and ensure consistent cache behavior across the entire application.
 */

export const CACHE_VERSION = '3.0.2';

export const CACHE_NAMES = {
  STATIC: `realaist-static-${CACHE_VERSION}`,
  DYNAMIC: `realaist-dynamic-${CACHE_VERSION}`,
  API: `realaist-api-${CACHE_VERSION}`,
  IMAGES: `realaist-images-${CACHE_VERSION}`,
} as const;

export const CACHE_DURATIONS = {
  STATIC: 365 * 24 * 60 * 60 * 1000, // 1 year
  DYNAMIC: 24 * 60 * 60 * 1000,      // 1 day
  API: 5 * 60 * 1000,                // 5 minutes
  IMAGES: 7 * 24 * 60 * 60 * 1000,   // 1 week
  USER_DATA: 30 * 60 * 1000,         // 30 minutes
  PROPERTIES: 10 * 60 * 1000,        // 10 minutes
} as const;

export const CACHE_KEYS = {
  PROPERTIES: 'properties',
  PROPERTIES_FILTERED: 'properties-filtered',
  USER_PROFILE: 'user-profile',
  AUTH_STATE: 'auth-state',
} as const;

export type CacheType = 'static' | 'dynamic' | 'api' | 'images';

export type CacheName = typeof CACHE_NAMES[keyof typeof CACHE_NAMES];
