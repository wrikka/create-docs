import path from "node:path";
import { fileURLToPath } from "node:url";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	root: path.resolve(__dirname, "dev"),
	plugins: [UnoCSS(), solid()],
	resolve: {
		dedupe: ["solid-js", "@tanstack/solid-router"],
		alias: {
			"@wrikka/create-docs/solid": path.resolve(
				__dirname,
				"src/runtime/index.ts",
			),
			"@wrikka/create-docs/theme.css": path.resolve(
				__dirname,
				"src/runtime/theme.css",
			),
			"@wrikka/create-docs/markdown-content.css": path.resolve(
				__dirname,
				"src/runtime/markdown-content.css",
			),
		},
	},
	server: { port: 5174 },
});
