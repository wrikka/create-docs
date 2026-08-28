import { defineConfig } from "bunup";

export default defineConfig({
	entry: ["./src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: true,
	target: "bun",
	outDir: "./dist",
	exports: true,
});
