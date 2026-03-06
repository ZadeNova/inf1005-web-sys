// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";
// import { resolve } from "path";

// // https://vite.dev/config/
// export default defineConfig({
// 	plugins: [react(), tailwindcss()],
// 	build: {},
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "url";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(), // ← Add this
	],
	build: {
		outDir: "../backend/public/assets",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				home: resolve(__dirname, "src/pages/main.jsx"),
				about: resolve(__dirname, "src/pages/main.jsx"),
			},
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "chunks/[name].js",
				assetFileNames: "[name].[ext]",
			},
		},
	},
	server: {
		port: 3000,
		proxy: {
			"/api": "http://localhost:8000",
		},
	},
});
