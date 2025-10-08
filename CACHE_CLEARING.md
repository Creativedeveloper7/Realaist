# 🧹 Cache Clearing System for Realaist

This document explains the comprehensive cache clearing system implemented for the Realaist website.

## 🚀 Quick Start

### For Users (Browser Cache)
- **Automatic**: Cache is automatically cleared every 7 days
- **Manual**: Use the developer tools button (🛠️) in the bottom-right corner (development mode only)
- **Force Refresh**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### For Developers (All Caches)
```bash
# Clear all caches and restart dev server
npm run dev-clean

# Clear all caches and build
npm run build-clean

# Clear specific caches
npm run clear-cache    # All caches
npm run clear-build    # Build cache only
npm run clear-npm      # npm cache only
npm run clear-vite     # Vite cache only
npm run fresh-install  # Nuclear option (reinstall dependencies)
```

## 🛠️ Components

### 1. Command Line Script (`scripts/clear-cache.js`)
- **Purpose**: Clear build, npm, and Vite caches
- **Usage**: `node scripts/clear-cache.js [options]`
- **Options**:
  - `--all`: Clear all caches (recommended)
  - `--build`: Clear build cache (dist, .vite, etc.)
  - `--npm`: Clear npm cache
  - `--vite`: Clear Vite cache
  - `--deps`: Reinstall dependencies (nuclear option)

### 2. Service Worker (`public/sw.js`)
- **Purpose**: Manage browser cache automatically
- **Features**:
  - Automatic cache versioning
  - Periodic cleanup (every 24 hours)
  - Cache invalidation on updates
  - Offline functionality

### 3. Cache Manager (`src/utils/cacheManager.ts`)
- **Purpose**: Frontend cache management
- **Features**:
  - Clear browser cache via Cache API
  - Clear localStorage and sessionStorage
  - Auto-clear old caches (7+ days)
  - Service worker communication

### 4. UI Components (`src/components/CacheClearButton.tsx`)
- **Purpose**: User-friendly cache clearing interface
- **Components**:
  - `CacheClearButton`: Manual cache clearing button
  - `DeveloperCacheTools`: Development-only tools panel

## 🔧 How It Works

### Automatic Cache Management
1. **Service Worker**: Automatically manages browser cache
2. **Version Control**: Each build gets a unique version
3. **Auto-Cleanup**: Old caches are automatically removed
4. **Update Detection**: New versions trigger cache refresh

### Manual Cache Clearing
1. **User Interface**: Click the cache clear button
2. **Service Worker**: Clears all cached files
3. **Browser Cache**: Clears Cache API storage
4. **Local Storage**: Clears app-specific data
5. **Force Refresh**: Reloads the page with fresh content

### Development Tools
1. **Developer Panel**: Accessible via 🛠️ button (dev mode only)
2. **Multiple Options**: Clear cache, storage, or console
3. **Real-time Feedback**: Shows clearing progress and success

## 📱 Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Mobile browsers (full support)

## 🚨 Troubleshooting

### Cache Not Clearing?
1. **Try the nuclear option**: `npm run fresh-install`
2. **Clear browser data manually**: Settings → Privacy → Clear browsing data
3. **Disable service worker**: DevTools → Application → Service Workers → Unregister

### Still Having Issues?
1. **Check console**: Look for cache-related errors
2. **Verify service worker**: Check if it's registered in DevTools
3. **Force refresh**: Use `Ctrl+F5` or `Cmd+Shift+R`

### Development Issues?
1. **Clear all caches**: `npm run clear-cache`
2. **Restart dev server**: `npm run dev-clean`
3. **Check Vite cache**: `npm run clear-vite`

## 🔄 Cache Lifecycle

```
1. App Start → Check cache age
2. If > 7 days → Auto-clear cache
3. Service Worker → Manage browser cache
4. User Action → Manual cache clear
5. Build → Generate new cache version
6. Update → Invalidate old cache
```

## 📊 Cache Information

The system tracks:
- **Version**: Current cache version
- **Last Cleared**: When cache was last cleared
- **Size**: Approximate cache size
- **Age**: How old the cache is

## 🎯 Best Practices

### For Users
- Let the system auto-manage cache
- Use manual clear only when experiencing issues
- Force refresh if content seems outdated

### For Developers
- Use `npm run dev-clean` when starting development
- Use `npm run build-clean` before deploying
- Clear cache when switching branches
- Use developer tools for debugging

## 🔮 Future Enhancements

- [ ] Cache size monitoring
- [ ] Selective cache clearing
- [ ] Cache compression
- [ ] Offline-first architecture
- [ ] Cache analytics dashboard

---

**Need Help?** Check the console for cache-related logs or use the developer tools panel (🛠️) in development mode.
