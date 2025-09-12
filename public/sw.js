/**
 * Service Worker for Automatic Cache Management
 * 
 * This service worker automatically handles cache clearing and updates
 * to ensure users always get the latest version of the website.
 */

const CACHE_NAME = 'realaist-v1.0.0';
const STATIC_CACHE_NAME = 'realaist-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'realaist-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
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
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
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

// Fetch event - serve from cache or network
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
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // If we have a cached version, check if it's still fresh
        if (cachedResponse) {
          // For HTML files, always try to get fresh version
          if (request.destination === 'document') {
            return fetch(request)
              .then((networkResponse) => {
                // Update cache with fresh response
                if (networkResponse.ok) {
                  const responseClone = networkResponse.clone();
                  caches.open(DYNAMIC_CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
                return networkResponse;
              })
              .catch(() => {
                // If network fails, serve cached version
                return cachedResponse;
              });
          }
          
          // For other files, serve cached version immediately
          return cachedResponse;
        }
        
        // No cached version, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Fetch failed', error);
            throw error;
          });
      })
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
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    default:
      console.log('❓ Service Worker: Unknown message action:', action);
  }
});

// Periodic cache cleanup (every 24 hours)
setInterval(() => {
  console.log('🧹 Service Worker: Running periodic cache cleanup...');
  
  caches.keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Cleaning up old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker: Periodic cleanup complete');
    })
    .catch((error) => {
      console.error('❌ Service Worker: Periodic cleanup failed', error);
    });
}, 24 * 60 * 60 * 1000); // 24 hours
