import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cacheManager } from '../utils/cacheManager';
import { unifiedCacheService } from '../services/unifiedCacheService';
import { tabFocusHandler } from '../utils/tabFocusHandler';

interface CacheClearButtonProps {
  isDarkMode: boolean;
  className?: string;
}

export const CacheClearButton: React.FC<CacheClearButtonProps> = ({ 
  isDarkMode, 
  className = '' 
}) => {
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear unified cache
      unifiedCacheService.clearAll();
      unifiedCacheService.clearPropertyCaches();
      unifiedCacheService.clearUserCaches();
      
      // Clear service worker caches
      await cacheManager.clearAllCaches();
      
      setShowSuccess(true);
      setLastCleared(new Date().toLocaleString());
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Force refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Cache clearing failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const getCacheInfo = () => {
    const unifiedStats = unifiedCacheService.getStats();
    return {
      version: '3.0.2',
      lastCleared: lastCleared || 'Never',
      size: unifiedStats.memoryUsage,
      entries: unifiedStats.entries.length,
      memoryUsage: unifiedStats.memoryUsage
    };
  };

  const cacheInfo = getCacheInfo();

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleClearCache}
        disabled={isClearing}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
          flex items-center gap-2
          ${isDarkMode 
            ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30' 
            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }
          ${isClearing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        whileHover={{ scale: isClearing ? 1 : 1.05 }}
        whileTap={{ scale: isClearing ? 1 : 0.95 }}
      >
        {isClearing ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Clear Cache
          </>
        )}
      </motion.button>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            absolute top-full left-0 mt-2 px-3 py-2 rounded-lg text-sm font-medium
            ${isDarkMode 
              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
              : 'bg-green-50 text-green-600 border border-green-200'
            }
            shadow-lg z-50
          `}
        >
          ✅ Cache cleared successfully!
        </motion.div>
      )}

      {/* Cache Info Tooltip */}
      {cacheInfo && (
        <div className={`
          absolute top-full left-0 mt-2 p-3 rounded-lg text-xs
          ${isDarkMode 
            ? 'bg-gray-800 text-gray-300 border border-gray-700' 
            : 'bg-white text-gray-600 border border-gray-200'
          }
          shadow-lg z-40 min-w-[200px]
        `}>
          <div className="font-medium mb-1">Cache Information</div>
          <div>Version: {cacheInfo.version}</div>
          <div>Last Cleared: {cacheInfo.lastCleared}</div>
          <div>Entries: {cacheInfo.entries}</div>
          <div>Memory: {(cacheInfo.memoryUsage / 1024).toFixed(1)} KB</div>
        </div>
      )}
    </div>
  );
};

// Developer Tools Component
export const DeveloperCacheTools: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [showTools, setShowTools] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setShowTools(!showTools)}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isDarkMode 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
          }
          shadow-lg border
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🛠️
      </motion.button>

      {showTools && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`
            absolute bottom-16 right-0 p-4 rounded-lg shadow-lg
            ${isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
            }
            min-w-[250px]
          `}
        >
          <div className="font-medium mb-3">Developer Tools</div>
          
          <div className="space-y-2">
            <CacheClearButton isDarkMode={isDarkMode} />
            
            <motion.button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className={`
                w-full px-3 py-2 rounded text-sm
                ${isDarkMode 
                  ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30' 
                  : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear All Storage
            </motion.button>
            
            <motion.button
              onClick={() => {
                console.clear();
                console.log('🧹 Console cleared');
              }}
              className={`
                w-full px-3 py-2 rounded text-sm
                ${isDarkMode 
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Console
            </motion.button>
            
            <motion.button
              onClick={() => {
                const stats = unifiedCacheService.getStats();
                console.log('📊 Cache Statistics:', stats);
                console.log('🔍 Cache Entries:', stats.entries);
                alert(`Cache Stats:\nEntries: ${stats.entries.length}\nMemory: ${(stats.memoryUsage / 1024).toFixed(1)} KB`);
              }}
              className={`
                w-full px-3 py-2 rounded text-sm
                ${isDarkMode 
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Show Cache Stats
            </motion.button>
            
            <motion.button
              onClick={async () => {
                try {
                  await tabFocusHandler.forceRefreshAllData();
                  alert('Data refreshed successfully!');
                } catch (error) {
                  console.error('Error refreshing data:', error);
                  alert('Error refreshing data. Check console for details.');
                }
              }}
              className={`
                w-full px-3 py-2 rounded text-sm
                ${isDarkMode 
                  ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Refresh Data
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
