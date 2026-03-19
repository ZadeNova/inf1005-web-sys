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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

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
		name: "mpa-rewrite",
		configureServer(server) {
			server.middlewares.use((req, _res, next) => {
				const routes = {
					"/": "/index.html",
					"/admin": "/admin.html",
					"/login": "/login.html",
					"/register": "/register.html",
					"/blog": "/blog.html",
					"/dashboard": "/dashboard.html",
					"/profile": "/profile.html",
					"/listings": "/listings.html",
				};

				// Strip trailing slash (except root) and query string for matching
				const pathname = req.url.split("?")[0].replace(/\/$/, "") || "/";

				if (routes[pathname]) {
					req.url = routes[pathname];
				}

				next();
			});
		},
	};
}

export default defineConfig({
	plugins: [react({ jsxRuntime: 'automatic' }), tailwindcss(), mpaRewritePlugin()],

	build: {
		outDir: "../public/assets",
		emptyOutDir: true,
		assetsDir: ".",
		manifest: true,
		rollupOptions: {
			input: resolve(__dirname, "src/main.jsx"),
		},
	},

	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: "http://apache:80",
				changeOrigin: true,
			},
		},
	},
});
