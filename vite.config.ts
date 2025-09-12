import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate unique file names for cache busting
    rollupOptions: {
      output: {
        // Add timestamp to chunk names for cache busting
        chunkFileNames: (chunkInfo) => {
          const timestamp = Date.now();
          return `assets/[name]-${timestamp}-[hash].js`;
        },
        entryFileNames: (chunkInfo) => {
          const timestamp = Date.now();
          return `assets/[name]-${timestamp}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const timestamp = Date.now();
          return `assets/[name]-${timestamp}-[hash].[ext]`;
        }
      }
    },
    // Clear cache before build
    emptyOutDir: true
  },
  server: {
    // Force reload on file changes
    hmr: {
      overlay: true
    }
  },
  // Clear cache on dev server start
  clearScreen: true
})