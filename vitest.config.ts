import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: [{ find: /^@create-docs\/(.*)$/, replacement: "src/$1" }],
	},
	test: {
		environment: "node",
		passWithNoTests: true,
	},
});
