/**
 * Optimized Service Worker for Realaist
 * 
 * This service worker provides intelligent caching with proper cache invalidation
 * and optimized performance for production use.
 */

const CACHE_VERSION = '2.0.1757721910655';
const STATIC_CACHE_NAME = `realaist-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `realaist-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `realaist-api-${CACHE_VERSION}`;

// Static files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 365 * 24 * 60 * 60 * 1000, // 1 year
  DYNAMIC: 24 * 60 * 60 * 1000,      // 1 day
  API: 5 * 60 * 1000,                // 5 minutes
  IMAGES: 7 * 24 * 60 * 60 * 1000    // 1 week
};

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Activation failed', error);
      })
  );
});

// Helper function to determine cache strategy
function getCacheStrategy(url, request) {
  const pathname = url.pathname;
  
  // Skip authentication requests entirely
  if (pathname.includes('/auth/') || pathname.includes('/user') || pathname.includes('/token')) {
    return { strategy: 'network-only', cacheName: null, duration: 0 };
  }
  
  // API calls - short cache (but not auth)
  if (pathname.includes('/api/') || url.hostname.includes('supabase')) {
    return { strategy: 'api', cacheName: API_CACHE_NAME, duration: CACHE_DURATIONS.API };
  }
  
  // Static assets - long cache
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return { strategy: 'static', cacheName: STATIC_CACHE_NAME, duration: CACHE_DURATIONS.STATIC };
  }
  
  // Images - medium cache
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    return { strategy: 'images', cacheName: DYNAMIC_CACHE_NAME, duration: CACHE_DURATIONS.IMAGES };
  }
  
  // HTML pages - network first
  if (request.destination === 'document') {
    return { strategy: 'network-first', cacheName: DYNAMIC_CACHE_NAME, duration: CACHE_DURATIONS.DYNAMIC };
  }
  
  // Default - cache first
  return { strategy: 'cache-first', cacheName: DYNAMIC_CACHE_NAME, duration: CACHE_DURATIONS.DYNAMIC };
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  const { strategy, cacheName, duration } = getCacheStrategy(url, request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'network-first':
            // Try network first, fallback to cache
            try {
              const networkResponse = await fetch(request);
              if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            } catch (error) {
              const cachedResponse = await caches.match(request);
              if (cachedResponse) {
                return cachedResponse;
              }
              throw error;
            }
            
          case 'cache-first':
            // Try cache first, fallback to network
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
            
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              const cache = await caches.open(cacheName);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
            
          case 'api':
            // API calls with short cache - but skip authentication requests
            if (url.pathname.includes('/auth/') || url.pathname.includes('/user')) {
              // Don't cache authentication requests
              return fetch(request);
            }
            
            const apiCached = await caches.match(request);
            if (apiCached) {
              // Check if cache is still fresh
              const cacheTime = apiCached.headers.get('sw-cache-time');
              if (cacheTime && Date.now() - parseInt(cacheTime) < duration) {
                return apiCached;
              }
            }
            
            const apiResponse = await fetch(request);
            if (apiResponse.ok) {
              const cache = await caches.open(cacheName);
              // Create a new response with cache time header
              const responseBody = await apiResponse.clone().text();
              const newResponse = new Response(responseBody, {
                status: apiResponse.status,
                statusText: apiResponse.statusText,
                headers: {
                  ...Object.fromEntries(apiResponse.headers.entries()),
                  'sw-cache-time': Date.now().toString()
                }
              });
              cache.put(request, newResponse);
            }
            return apiResponse;
            
          case 'network-only':
            // Always fetch from network, no caching
            return fetch(request);
            
          default:
            return fetch(request);
        }
      } catch (error) {
        console.error('❌ Service Worker: Fetch failed', error);
        throw error;
      }
    })()
  );
});

// Message event - handle cache clearing commands
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'CLEAR_CACHE':
      console.log('🧹 Service Worker: Clearing all caches...');
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('🗑️ Service Worker: Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          console.log('✅ Service Worker: All caches cleared');
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error('❌ Service Worker: Cache clearing failed', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
      
    case 'SKIP_WAITING':
      console.log('⏭️ Service Worker: Skipping waiting...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_API_CACHE':
      console.log('🧹 Service Worker: Clearing API cache...');
      caches.delete(API_CACHE_NAME)
        .then(() => {
          console.log('✅ Service Worker: API cache cleared');
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error('❌ Service Worker: API cache clearing failed', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
      
    default:
      console.log('❓ Service Worker: Unknown message action:', action);
  }
});
