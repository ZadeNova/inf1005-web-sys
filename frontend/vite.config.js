/**
 * vite.config.js — Vapour FT
 * Frontend Lead only — do not edit.
 *
 * Multi-page setup for local prototype development.
 * Each page has its own HTML entry so devs can work independently.

 *   /              → index.html     (Lead — Home)
 *   /community     → community.html (Lead — Community)
 *   /login         → login.html     (Dev 1)
 *   /register      → register.html  (Dev 1)
 *   /blog          → blog.html      (Dev 1)
 *   /dashboard     → dashboard.html (Dev 2)
 *   /profile       → profile.html   (Dev 2)
 *   /listings      → listings.html  (Dev 2)
 *
 * Integration: swap build input to { main: src/main.jsx } only.
 */

import { defineConfig }       from 'vite';
import react                  from '@vitejs/plugin-react';
import tailwindcss            from '@tailwindcss/vite';
import { resolve }            from 'path';
import { fileURLToPath }      from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    outDir:      '../backend/public/assets',
    emptyOutDir: true,
    manifest:    true,
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        community: resolve(__dirname, 'community.html'),
        login:     resolve(__dirname, 'login.html'),
        register:  resolve(__dirname, 'register.html'),
        blog:      resolve(__dirname, 'blog.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        profile:   resolve(__dirname, 'profile.html'),
        listings:  resolve(__dirname, 'listings.html'),
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },

  server: {
    port: 3000,

    proxy: {
      '/api': {
        target:       'http://nginx:80',
        changeOrigin: true,
      },
    },

    /**
     * URL rewriting for MPA local dev.
     *
     * Vite serves files, not routes. Without this, navigating to
     * localhost:3000/login returns a 404 because there is no /login file.
     *
     * This middleware maps each clean URL to its HTML file so Vite
     * serves the right entry point — exactly mimicking what Slim does
     * in production via its router.
     *
     * Add a new entry here whenever a new page HTML file is created.
     */
    middlewares: [
      (req, _res, next) => {
        const routes = {
          '/':          '/index.html',
          '/community': '/community.html',
          '/login':     '/login.html',
          '/register':  '/register.html',
          '/blog':      '/blog.html',
          '/dashboard': '/dashboard.html',
          '/profile':   '/profile.html',
          '/listings':  '/listings.html',
        };

        // Strip trailing slash (except root) and query string for matching
        const pathname = req.url.split('?')[0].replace(/\/$/, '') || '/';

        if (routes[pathname]) {
          req.url = routes[pathname];
        }

        next();
      },
    ],
  },
});