import { initTheme, mountDocsApp } from "@wrikka/create-docs/solid";
import "virtual:uno.css";
import { dataSource } from "./data-source";

initTheme("dark");

mountDocsApp({
	site: {
		title: "create-docs",
		description:
			"VitePress-style docs runtime with Scalar-like API references for SolidJS",
		repoUrl: "https://github.com/wrikka/bun-packages",
		logo: "i-mdi:book-open-page-variant",
		social: {
			npm: "https://www.npmjs.com/package/@wrikka/create-docs",
			twitter: "https://twitter.com/wrikka_",
			discord: "https://discord.gg/wrikka",
		},
	},
	github: {
		owner: "wrikka",
		repo: "bun-packages",
		branch: "main",
		stats: true,
		releases: true,
		contributors: true,
	},
	dataSource,
	defaultCollection: "docs",
	home: {
		hero: {
			name: "create-docs",
			text: "docs runtime",
			tagline: "Markdown in. Beautiful docs out.",
			actions: [
				{ text: "Get started", link: "/docs", theme: "brand" },
				{
					text: "GitHub",
					link: "https://github.com/wrikka/bun-packages",
					theme: "alt",
				},
			],
		},
		features: [
			{
				icon: "i-mdi:lightning-bolt-outline",
				title: "Zero-config runtime",
				details: "SolidJS + TanStack Router app shell driven by a data source.",
				link: "/docs",
			},
			{
				icon: "i-mdi:language-markdown-outline",
				title: "Rich markdown",
				details: "Callouts, code groups, steps, Mermaid, math, playgrounds.",
				link: "/docs",
			},
			{
				icon: "i-mdi:api",
				title: "API references",
				details: "OpenAPI / oRPC / Elysia / Nitro adapters with a playground.",
				link: "/docs",
			},
		],
	},
	features: {
		search: true,
		askAi: true,
		editLink: true,
		lastUpdated: true,
		themeToggle: true,
		breadcrumbs: true,
		reportIssue: true,
		openPR: true,
		pwa: false,
		analytics: true,
	},
	topNav: [
		{ label: "Docs", to: "/docs/index" },
		{ label: "API", to: "/api/index" },
		{ label: "Showcase", to: "/showcase/index" },
	],
	i18n: { current: "en", list: [{ id: "en", label: "English" }] },
	theme: { defaultMode: "dark" },
});
