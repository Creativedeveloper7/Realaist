import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for production caching
    rollupOptions: {
      output: {
        // Use content hash for proper cache busting without timestamps
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Clear cache before build
    emptyOutDir: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Force cache busting
    sourcemap: false,
    // Use esbuild (default) to avoid requiring terser on Vercel
    minify: 'esbuild'
  },
  server: {
<<<<<<< HEAD
    port: 5175,
=======
>>>>>>> badcbd12fee5a2d6a31ce865809cbf0286a153da
    // Force reload on file changes
    hmr: {
      overlay: true
    }
  },
  // Clear cache on dev server start
  clearScreen: true,
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react']
  }
})