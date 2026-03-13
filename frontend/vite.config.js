/**
 * vite.config.js — Vapour FT
 * Frontend Lead only — do not edit.
 *
 * Multi-page setup for local prototype development.
 * Each page has its own HTML entry so devs can work independently.
 *
 * Local dev:  npm run dev → localhost:3000
 *   /              → index.html     (CL — Home)
 *   /community     → community.html (CL — Community)
 *   /login         → login.html     (Minal — Dev 1)
 *   /register      → register.html  (Minal — Dev 1)
 *   /blog          → blog.html      (Minal — Dev 1)
 *   /dashboard     → dashboard.html (WH — Dev 2)
 *   /profile       → profile.html   (WH — Dev 2)
 *   /listings      → listings.html  (WH — Dev 2)
 *
 * Integration: swap build input to { main: src/main.jsx } only.
 */

import { defineConfig }  from 'vite';
import react             from '@vitejs/plugin-react';
import tailwindcss       from '@tailwindcss/vite';
import { resolve }       from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

/**
 * MPA URL Rewrite Plugin
 *
 * Vite serves files, not routes. Without this, navigating to
 * localhost:3000/login returns a 404 because there is no /login file.
 *
 * This plugin maps each clean URL to its HTML file so Vite serves
 * the right entry point — exactly mimicking what Slim does in
 * production via its router.
 *
 * Add a new entry to routes{} whenever a new page HTML file is created.
 */
function mpaRewritePlugin() {
  return {
    name: 'mpa-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
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
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mpaRewritePlugin(),
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
  },
});