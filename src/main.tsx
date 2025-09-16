import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

// Import debug utility for development
import './utils/authDebug';

// Import cache invalidation utility
import { initializeCacheVersion, checkForUpdates } from './utils/cacheInvalidation';

// Initialize cache version check
initializeCacheVersion();

// Service Worker cache invalidation
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FORCE_RELOAD') {
      console.log('🔄 Service Worker: Force reloading page for cache invalidation');
      window.location.reload();
    }
  });
  
  // Check for updates periodically
  setInterval(checkForUpdates, 30000); // Check every 30 seconds
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
