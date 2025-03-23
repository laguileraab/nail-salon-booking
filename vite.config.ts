import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'MärchenNails',
          short_name: 'MärchenNails',
          description: 'Book your nail salon appointments online',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      // Use PostCSS config file instead of inline configuration
      // This avoids dynamic requires
      // The configuration is now in postcss.config.js
    },
    build: {
      minify: isProduction,
      sourcemap: !isProduction,
      // Increase the chunk size warning limit to avoid unnecessary warnings
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Improved manual chunking strategy to reduce bundle sizes
          manualChunks: (id) => {
            // Core dependencies
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') || 
                id.includes('node_modules/react-router-dom/')) {
              return 'vendor-core';
            }
            
            // UI components
            if (id.includes('node_modules/react-icons/') || 
                id.includes('node_modules/react-hot-toast/')) {
              return 'vendor-ui';
            }
            
            // Auth related dependencies
            if (id.includes('node_modules/@supabase/') || 
                id.includes('node_modules/jwt-decode/')) {
              return 'vendor-auth';
            }
            
            // Date and time libraries
            if (id.includes('node_modules/date-fns/') || 
                id.includes('node_modules/dayjs/')) {
              return 'vendor-datetime';
            }
            
            // Other common third-party libraries
            if (id.includes('node_modules/')) {
              return 'vendor-others';
            }
          }
        }
      }
    },
    base: "/",  // Ensure proper base path for assets
    server: {
      port: 3000,
      open: true
    },
    preview: {
      port: 3000
    }
  };
});
