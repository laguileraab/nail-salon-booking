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
      // Fix optimization issues
      commonjsOptions: {
        transformMixedEsModules: true,
        strictRequires: true
      },
      // Disable code splitting to prevent initialization order issues
      target: 'esnext',
      rollupOptions: {
        output: {
          // Resolve the import order issue by simplifying the chunking strategy
          manualChunks: (id) => {
            // Core dependencies - React and its ecosystem
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            
            // Supabase and auth-related dependencies
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            
            // All other third-party libraries together
            if (id.includes('node_modules/')) {
              return 'vendor-deps';
            }
          },
          // Ensure consistent module evaluation order
          hoistTransitiveImports: false,
          // Reduce chunk splitting to prevent initialization problems
          experimentalMinChunkSize: 10000
        }
      }
    },
    base: "/",  // Ensure proper base path for assets
    preview: {
      port: 3001,
      strictPort: false,
      open: true
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
