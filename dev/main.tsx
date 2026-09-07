import { mountDocsApp, officialPlugins } from "@wrikka/create-docs/solid";
import "virtual:uno.css";
import { dataSource } from "./data-source";

mountDocsApp({
	site: {
		title: "create-docs",
		description:
			"VitePress-style docs runtime with Scalar-like API references for SolidJS",
		repoUrl: "https://github.com/wrikka/create-docs",
		logo: "i-mdi:book-open-page-variant",
		social: {
			npm: "https://www.npmjs.com/package/@wrikka/create-docs",
			twitter: "https://twitter.com/wrikka_",
			discord: "https://discord.gg/wrikka",
		},
	},
	github: {
		owner: "wrikka",
		repo: "create-docs",
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
					link: "https://github.com/wrikka/create-docs",
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
		frontmatterToggle: true,
		searchPage: true,
		translate: true,
	},
	translate: {
		provider: "ai",
		workflow: "translate.yml",
		locales: [
			{ id: "th", label: "ไทย" },
			{ id: "ja", label: "日本語" },
			{ id: "zh", label: "中文" },
		],
	},
	topNav: [
		{ label: "Docs", to: "/docs/index", icon: "i-mdi:book-open-page-variant" },
		{ label: "API", to: "/api/index", icon: "i-mdi:api" },
		{ label: "Showcase", to: "/showcase/index", icon: "i-mdi:view-dashboard" },
	],
	plugins: officialPlugins,
	showcase: [
		{
			id: "wrikka-docs",
			label: "Wrikka Docs",
			description: "The documentation site you are looking at right now.",
			icon: "i-mdi:book-open-page-variant",
			link: "https://github.com/wrikka/create-docs",
			tags: ["Docs", "SolidJS"],
			badge: "Featured",
		},
		{
			id: "api-reference",
			label: "API reference",
			description:
				"Scalar-style OpenAPI reference with an interactive playground.",
			icon: "i-mdi:api",
			tags: ["OpenAPI", "Playground"],
			coverColor: "#7c3aed",
			collection: "api",
			docId: "index",
		},
		{
			id: "cli-starter",
			label: "CLI starter",
			description: "Bun-powered CLI scaffold generated from the same runtime.",
			icon: "i-mdi:console",
			tags: ["CLI", "Bun"],
			coverColor: "#0ea5e9",
			link: "/docs/getting-started",
		},
	],
	i18n: {
		current: "en",
		list: [
			{ id: "en", label: "English" },
			{ id: "th", label: "ไทย" },
			{ id: "ja", label: "日本語" },
		],
	},
	theme: { defaultMode: "dark" },
});
