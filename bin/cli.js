#!/usr/bin/env node
/**
 * create @wrikka/docs — scaffold a new documentation site.
 *
 *   bun create @wrikka/docs my-docs
 *   npm create @wrikka/docs my-docs
 *   pnpm create @wrikka/docs my-docs
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

const PKG = "@wrikka/create-docs";

async function ask(question, fallback) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((res) => {
		rl.question(question, (answer) => {
			rl.close();
			res(answer.trim() || fallback);
		});
	});
}

const templates = {
	"package.json": (name) =>
		JSON.stringify(
			{
				name,
				version: "0.1.0",
				private: true,
				type: "module",
				scripts: {
					dev: "vite",
					build: "vite build",
					preview: "vite preview",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					[PKG]: "^0.1.0",
					"@tanstack/solid-router": "^1.170.30",
					"solid-js": "^1.9.15",
				},
				devDependencies: {
					"@iconify-json/mdi": "^1.2.3",
					typescript: "^7.0.0",
					unocss: "^66.10.0",
					vite: "^8.0.0",
					"vite-plugin-solid": "^2.11.0",
				},
			},
			null,
			"\t",
		) + "\n",

	"vite.config.ts": () => `import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [UnoCSS(), solid()],
	resolve: {
		dedupe: ["solid-js", "@tanstack/solid-router"],
	},
	build: {
		target: "esnext",
		sourcemap: true,
	},
});
`,

	"uno.config.ts": () => `import {
	defineConfig,
	presetIcons,
	presetWind4,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			preflights: { reset: true, theme: "on-demand", property: true },
			dark: "class",
		}),
		presetIcons({
			scale: 1.1,
			collections: {
				mdi: () =>
					import("@iconify-json/mdi/icons.json").then((i) => i.default),
			},
		}),
	],
	transformers: [transformerVariantGroup(), transformerDirectives()],
	theme: {
		colors: {
			primary: {
				DEFAULT: "hsl(var(--color-primary))",
				hover: "hsl(var(--color-primary-hover))",
				foreground: "hsl(var(--color-primary-foreground))",
			},
			background: "hsl(var(--color-background))",
			foreground: "hsl(var(--color-foreground))",
			surface: "hsl(var(--color-surface))",
			muted: "hsl(var(--color-muted))",
			border: "hsl(var(--color-border))",
			focus: "hsl(var(--color-focus))",
		},
	},
	content: {
		filesystem: [
			"./index.html",
			"./src/**/*.{ts,tsx,html}",
			"./node_modules/${PKG}/src/runtime/**/*.{ts,tsx}",
		],
	},
});
`,

	"index.html": (name) => `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark light" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`,

	"tsconfig.json": () =>
		JSON.stringify(
			{
				compilerOptions: {
					target: "ESNext",
					module: "ESNext",
					moduleResolution: "bundler",
					jsx: "preserve",
					jsxImportSource: "solid-js",
					strict: true,
					skipLibCheck: true,
					types: ["vite/client"],
					noEmit: true,
				},
				include: ["src", "vite.config.ts", "uno.config.ts"],
			},
			null,
			"\t",
		) + "\n",

	".gitignore": () => `node_modules
dist
.wrangler
`,

	"src/index.tsx":
		() => `import { initTheme, mountDocsApp } from "${PKG}/solid";
import "${PKG}/theme.css";
import "${PKG}/markdown-content.css";
import "virtual:uno.css";
import { docsAppConfig } from "./app-config";

initTheme();
mountDocsApp(docsAppConfig);
`,

	"src/data-source.ts": () => `import type {
	CollectionMeta,
	DocContent,
	DocEntry,
	DocsDataSource,
	SearchResult,
} from "${PKG}/solid";

// Bundles every markdown file under ./docs into the app at build time.
const files = import.meta.glob("../docs/**/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

function titleOf(id: string): string {
	return id
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

const entries: (DocEntry & { body: string })[] = Object.entries(files).map(
	([path, body]) => {
		const id = path
			.replace(/^.*docs\\//, "")
			.replace(/\\.md$/, "")
			.replace(/\\//g, "--");
		return {
			id,
			label: titleOf(id.split("--").pop() ?? id),
			category: "Docs",
			description: body.split("\\n").find((l) => l.trim() && !l.startsWith("#")) ?? "",
			path,
			type: "md",
			body,
		};
	},
);

export const staticDataSource: DocsDataSource = {
	async collections(): Promise<CollectionMeta[]> {
		return [
			{
				id: "docs",
				label: "Docs",
				icon: "i-mdi:book-open-page-variant",
				description: "Documentation",
			},
		];
	},
	async list(): Promise<DocEntry[]> {
		return entries;
	},
	async get(_collection: string, id: string): Promise<DocContent> {
		const doc = entries.find((d) => d.id === id);
		if (!doc) throw new Error("Document not found: " + id);
		return { content: doc.body };
	},
	async search(q: string): Promise<SearchResult[]> {
		const needle = q.toLowerCase();
		return entries
			.filter(
				(d) =>
					d.label.toLowerCase().includes(needle) ||
					d.body.toLowerCase().includes(needle),
			)
			.map((d) => ({
				collection: "docs",
				id: d.id,
				title: d.label,
				snippet: d.description,
				score: 1,
			}));
	},
};
`,

	"src/app-config.ts": () => `import type { DocsAppConfig } from "${PKG}/solid";
import { staticDataSource } from "./data-source";

export const docsAppConfig: DocsAppConfig = {
	site: {
		title: "My Docs",
		description: "Documentation built with @wrikka/create-docs",
	},
	dataSource: staticDataSource,
	defaultCollection: "docs",
	home: {
		hero: {
			name: "My Docs",
			text: "documentation",
			tagline: "Beautiful docs, zero config.",
			actions: [
				{ text: "Get started", link: "/docs", theme: "brand" },
			],
		},
	},
	features: {
		search: true,
		themeToggle: true,
		breadcrumbs: true,
		lastUpdated: true,
		pwa: true,
	},
};
`,

	"docs/getting-started.md": () => `# Getting Started

Welcome to your new documentation site, powered by **@wrikka/create-docs**.

## What's included

- VitePress-style layout with sidebar, TOC, and breadcrumbs
- Full-text search (Ctrl+K)
- Dark / light theme
- Callouts, code groups, Mermaid, and math support

> [!TIP]
> Add markdown files to the \`docs/\` folder — they appear automatically.

## Next steps

1. Edit \`src/app-config.ts\` to customise the site.
2. Add pages under \`docs/\`.
3. Run \`bun run build\` (or \`npm run build\`) and deploy \`dist/\` anywhere.
`,

	"docs/markdown-features.md": () => `# Markdown Features

## Callouts

> [!NOTE]
> Useful information.

> [!WARNING]
> Something to watch out for.

## Code groups

<code-group>

\`\`\`bash [bun]
bun create @wrikka/docs my-docs
\`\`\`

\`\`\`bash [npm]
npm create @wrikka/docs my-docs
\`\`\`

</code-group>

## Math

$$e^{i\\pi} + 1 = 0$$

## Mermaid

\`\`\`mermaid
graph TD
  A[Write markdown] --> B[Ship docs]
\`\`\`
`,

	"public/manifest.webmanifest": (name) =>
		JSON.stringify(
			{
				name,
				short_name: name,
				start_url: "/",
				display: "standalone",
				background_color: "#0b0d12",
				theme_color: "#0b0d12",
			},
			null,
			"\t",
		) + "\n",

	"public/sw.js": () => `const CACHE = "docs-v1";
self.addEventListener("install", (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
	e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
	const { request } = e;
	if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
	if (request.mode === "navigate") {
		e.respondWith(fetch(request).catch(() => caches.match("/")));
		return;
	}
	e.respondWith(
		caches.match(request).then((cached) => cached || fetch(request).then((res) => {
			if (res.ok) {
				const copy = res.clone();
				caches.open(CACHE).then((c) => c.put(request, copy));
			}
			return res;
		})),
	);
});
`,
};

async function main() {
	let name = process.argv[2];
	if (!name) name = await ask("Project name: ", "my-docs");
	const target = resolve(process.cwd(), name);

	if (existsSync(target)) {
		console.error("Error: directory already exists:", target);
		process.exit(1);
	}

	for (const [file, render] of Object.entries(templates)) {
		const dest = join(target, file);
		mkdirSync(join(dest, ".."), { recursive: true });
		writeFileSync(dest, render(name), "utf8");
	}

	const pm = process.env.npm_config_user_agent?.startsWith("bun")
		? "bun"
		: process.env.npm_config_user_agent?.startsWith("pnpm")
			? "pnpm"
			: "npm";

	console.log("\nDone! Next steps:\n");
	console.log("  cd " + name);
	console.log("  " + pm + " install");
	console.log("  " + pm + " run dev\n");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
