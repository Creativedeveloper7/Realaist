/**
 * Cache Management Utility
 * 
 * Provides functions to manage browser cache, service worker cache,
 * and localStorage cache for the Realaist website.
 */

export interface CacheInfo {
  version: string;
  lastCleared: string;
  size: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private serviceWorker: ServiceWorker | null = null;
  private readonly CACHE_VERSION = '2.0.0';
  private readonly CACHE_KEY = 'realaist_cache_info';

  private constructor() {
    this.initializeServiceWorker();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration.active || registration.waiting;
        
        console.log('🔧 Cache Manager: Service Worker registered');
        
        // Listen for service worker updates (disabled automatic notifications)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Cache Manager: New version available (auto-update disabled)');
                // Automatically update without showing notification
                this.updateServiceWorker();
              }
            });
          }
        });
      } catch (error) {
        console.error('❌ Cache Manager: Service Worker registration failed', error);
      }
    }
  }

  /**
   * Clear all browser caches
   */
  public async clearAllCaches(): Promise<boolean> {
    try {
      console.log('🧹 Cache Manager: Clearing all caches...');
      
      // Clear service worker cache
      if (this.serviceWorker) {
        await this.clearServiceWorkerCache();
      }
      
      // Clear browser cache
      await this.clearBrowserCache();
      
      // Clear localStorage cache
      this.clearLocalStorageCache();
      
      // Clear sessionStorage
      this.clearSessionStorage();
      
      // Update cache info
      this.updateCacheInfo();
      
      console.log('✅ Cache Manager: All caches cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Cache Manager: Cache clearing failed', error);
      return false;
    }
  }

  /**
   * Clear service worker cache
   */
  private async clearServiceWorkerCache(): Promise<void> {
    if (!this.serviceWorker) return;
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✅ Cache Manager: Service Worker cache cleared');
          resolve();
        } else {
          reject(new Error(event.data.error));
        }
      };
      
      this.serviceWorker!.postMessage(
        { action: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Clear API cache only
   */
  public async clearApiCache(): Promise<boolean> {
    try {
      console.log('🧹 Cache Manager: Clearing API cache...');
      
      // Clear service worker API cache
      if (this.serviceWorker) {
        await this.clearServiceWorkerApiCache();
      }
      
      // Clear in-memory API cache
      if (typeof window !== 'undefined' && (window as any).apiCacheService) {
        (window as any).apiCacheService.clearAll();
      }
      
      console.log('✅ Cache Manager: API cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Cache Manager: API cache clearing failed', error);
      return false;
    }
  }

  /**
   * Clear service worker API cache
   */
  private async clearServiceWorkerApiCache(): Promise<void> {
    if (!this.serviceWorker) return;
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✅ Cache Manager: Service Worker API cache cleared');
          resolve();
        } else {
          reject(new Error(event.data.error));
        }
      };
      
      this.serviceWorker!.postMessage(
        { action: 'CLEAR_API_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Clear browser cache using Cache API
   */
  private async clearBrowserCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Cache Manager: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
  }

  /**
   * Clear localStorage cache
   */
  private clearLocalStorageCache(): void {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('realaist_') ||
        key.startsWith('vite_') ||
        key.startsWith('cache_') ||
        key.includes('offline_mode')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ Cache Manager: Removed localStorage key:', key);
    });
  }

  /**
   * Clear sessionStorage
   */
  private clearSessionStorage(): void {
    sessionStorage.clear();
    console.log('🗑️ Cache Manager: Session storage cleared');
  }

  /**
   * Update cache information
   */
  private updateCacheInfo(): void {
    const cacheInfo: CacheInfo = {
      version: this.CACHE_VERSION,
      lastCleared: new Date().toISOString(),
      size: this.getCacheSize()
    };
    
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheInfo));
  }

  /**
   * Get cache size information
   */
  private getCacheSize(): number {
    let size = 0;
    
    // Calculate localStorage size
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    
    return size;
  }

  /**
   * Get cache information
   */
  public getCacheInfo(): CacheInfo | null {
    try {
      const cacheInfo = localStorage.getItem(this.CACHE_KEY);
      return cacheInfo ? JSON.parse(cacheInfo) : null;
    } catch (error) {
      console.error('❌ Cache Manager: Failed to get cache info', error);
      return null;
    }
  }

  /**
   * Check if cache needs clearing (older than 7 days)
   */
  public shouldClearCache(): boolean {
    const cacheInfo = this.getCacheInfo();
    if (!cacheInfo) return true;
    
    const lastCleared = new Date(cacheInfo.lastCleared);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return lastCleared < sevenDaysAgo;
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    if (confirm('🔄 A new version of the website is available. Would you like to update now?')) {
      this.updateServiceWorker();
    }
  }

  /**
   * Update service worker
   */
  private updateServiceWorker(): void {
    if (this.serviceWorker) {
      this.serviceWorker.postMessage({ action: 'SKIP_WAITING' });
      // Don't automatically reload - let the user continue using the app
      console.log('🔄 Cache Manager: Service worker updated, will take effect on next page load');
    }
  }

  /**
   * Force refresh the page
   */
  public forceRefresh(): void {
    console.log('🔄 Cache Manager: Force refreshing page...');
    window.location.reload();
  }

  /**
   * Auto-clear cache if needed
   */
  public async autoClearIfNeeded(): Promise<void> {
    if (this.shouldClearCache()) {
      console.log('🧹 Cache Manager: Auto-clearing old cache...');
      await this.clearAllCaches();
    }
  }

  /**
   * Get service worker version
   */
  public async getServiceWorkerVersion(): Promise<string | null> {
    if (!this.serviceWorker) return null;
    
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      
      this.serviceWorker!.postMessage(
        { action: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Auto-clear cache on app start if needed
if (typeof window !== 'undefined') {
  cacheManager.autoClearIfNeeded();
}
