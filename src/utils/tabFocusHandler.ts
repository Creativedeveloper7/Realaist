/**
 * Tab Focus Handler - Refreshes stale data when user returns to tab
 * 
 * This utility detects when the user returns to the website after inactivity
 * and refreshes any stale cached data to ensure fresh content.
 */

import { unifiedCacheService } from '../services/unifiedCacheService';
import { propertiesService } from '../services/propertiesService';

class TabFocusHandler {
  private isInitialized = false;
  private lastActivity = Date.now();
  private lastTabBlur = Date.now();
  private readonly STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

  /**
   * Initialize the tab focus handler
   */
  init(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    // Disabled auto-refresh - data remains static
    // this.setupEventListeners();
    console.log('🔄 TabFocusHandler: Initialized (auto-refresh disabled)');
  }

  /**
   * Setup event listeners for tab focus and visibility changes
   */
  private setupEventListeners(): void {
    // Handle tab focus/blur
    window.addEventListener('focus', this.handleTabFocus.bind(this));
    window.addEventListener('blur', this.handleTabBlur.bind(this));
    
    // Handle visibility changes (more reliable for mobile)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle page show/hide (for mobile back button)
    window.addEventListener('pageshow', this.handlePageShow.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
    
    // Track user activity
    this.setupActivityTracking();
  }

  /**
   * Handle tab focus event
   */
  private handleTabFocus(): void {
    console.log('🔄 TabFocusHandler: Tab focused');
    this.lastActivity = Date.now();
    this.refreshStaleDataIfNeeded();
  }

  /**
   * Handle tab blur event
   */
  private handleTabBlur(): void {
    console.log('🔄 TabFocusHandler: Tab blurred');
    this.lastTabBlur = Date.now();
  }

  /**
   * Handle visibility change event
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      console.log('🔄 TabFocusHandler: Page became visible');
      this.lastActivity = Date.now();
      this.refreshStaleDataIfNeeded();
    } else {
      console.log('🔄 TabFocusHandler: Page became hidden');
    }
  }

  /**
   * Handle page show event
   */
  private handlePageShow(): void {
    console.log('🔄 TabFocusHandler: Page shown');
    this.lastActivity = Date.now();
    this.refreshStaleDataIfNeeded();
  }

  /**
   * Handle page hide event
   */
  private handlePageHide(): void {
    console.log('🔄 TabFocusHandler: Page hidden');
  }

  /**
   * Setup activity tracking to detect user interaction
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        // Only update if it's been more than 30 seconds since last activity
        const now = Date.now();
        if (now - this.lastActivity > 30000) { // 30 seconds
          this.lastActivity = now;
          console.log('🔄 TabFocusHandler: User activity detected, resetting timer');
        }
      }, { passive: true });
    });
  }

  /**
   * Check if data should be refreshed based on inactivity time
   */
  private shouldRefreshData(): boolean {
    const timeSinceLastBlur = Date.now() - this.lastTabBlur;
    const shouldRefresh = timeSinceLastBlur > this.STALE_THRESHOLD;
    console.log(`🔄 TabFocusHandler: Time since last blur: ${Math.round(timeSinceLastBlur / 1000)}s, should refresh: ${shouldRefresh}`);
    return shouldRefresh;
  }

  /**
   * Refresh stale data if needed
   */
  private async refreshStaleDataIfNeeded(): Promise<void> {
    if (!this.shouldRefreshData()) {
      console.log('🔄 TabFocusHandler: No refresh needed, recent activity');
      return;
    }

    console.log('🔄 TabFocusHandler: Refreshing stale data...');
    
    try {
      // Check if properties cache is stale
      const propertiesCacheKey = 'properties-{}';
      if (unifiedCacheService.isStale(propertiesCacheKey)) {
        console.log('🔄 TabFocusHandler: Refreshing properties cache');
        await unifiedCacheService.refreshStaleData(
          propertiesCacheKey,
          () => propertiesService.getProperties()
        );
      }

      // Check for other stale caches and refresh them
      const stats = unifiedCacheService.getStats();
      for (const key of stats.entries) {
        if (unifiedCacheService.isStale(key)) {
          console.log(`🔄 TabFocusHandler: Found stale cache for ${key}`);
          // Clear stale cache so it will be refreshed on next access
          unifiedCacheService.clear(key);
        }
      }

      console.log('✅ TabFocusHandler: Stale data refresh completed');
    } catch (error) {
      console.error('❌ TabFocusHandler: Error refreshing stale data:', error);
    }
  }

  /**
   * Force refresh all data
   */
  async forceRefreshAllData(): Promise<void> {
    console.log('🔄 TabFocusHandler: Force refreshing all data...');
    
    try {
      // Clear all caches
      unifiedCacheService.clearAll();
      
      // Refresh properties
      await propertiesService.getProperties();
      
      console.log('✅ TabFocusHandler: Force refresh completed');
    } catch (error) {
      console.error('❌ TabFocusHandler: Error during force refresh:', error);
    }
  }

  /**
   * Get handler status
   */
  getStatus(): { 
    isInitialized: boolean; 
    lastActivity: number; 
    timeSinceLastActivity: number; 
    shouldRefresh: boolean;
    lastTabBlur: number;
    timeSinceLastBlur: number;
  } {
    return {
      isInitialized: this.isInitialized,
      lastActivity: this.lastActivity,
      timeSinceLastActivity: Date.now() - this.lastActivity,
      shouldRefresh: this.shouldRefreshData(),
      lastTabBlur: this.lastTabBlur,
      timeSinceLastBlur: Date.now() - this.lastTabBlur
    };
  }
}

// Export singleton instance
export const tabFocusHandler = new TabFocusHandler();

// Auto-initialize when module is loaded (only once)
if (typeof window !== 'undefined' && !(window as any).tabFocusHandlerInitialized) {
  tabFocusHandler.init();
  (window as any).tabFocusHandlerInitialized = true;
}
