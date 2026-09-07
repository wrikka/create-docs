import type { PluginInfo } from "./config";

/**
 * Official plugin catalog for the `/plugins` marketplace page.
 * `status`: "built-in" (shipped in the core package), "available"
 * (installable package), or "planned" (on the roadmap).
 */
export const officialPlugins: PluginInfo[] = [
	{
		name: "@wrikka/create-docs",
		description: "Core docs runtime — SolidJS, TanStack Router, MiniSearch.",
		icon: "i-mdi:book-open-page-variant",
		category: "Core",
		status: "built-in",
	},
	{
		name: "Search & command palette",
		description:
			"MiniSearch full-text search, /search page, nav search, and Ctrl K palette.",
		icon: "i-mdi:magnify",
		category: "Core",
		status: "built-in",
	},
	{
		name: "SEO feeds",
		description:
			"Sitemap, RSS/Atom, JSON Feed, robots.txt, and Open Graph generation.",
		icon: "i-mdi:rss",
		category: "Core",
		status: "built-in",
	},
	{
		name: "PWA",
		description:
			"Service worker, web manifest, and offline support out of the box.",
		icon: "i-mdi:cellphone-arrow-down",
		category: "Core",
		status: "built-in",
	},
	{
		name: "OpenAPI adapter",
		description:
			"Render OpenAPI specs as interactive API reference pages with a live playground.",
		icon: "i-mdi:api",
		category: "Adapters",
		status: "built-in",
		url: "https://github.com/wrikka/create-docs",
	},
	{
		name: "oRPC adapter",
		description: "Generate docs from oRPC router definitions.",
		icon: "i-mdi:lan-connect",
		category: "Adapters",
		status: "built-in",
	},
	{
		name: "Elysia adapter",
		description: "Auto-generate docs from Elysia Eden treaties.",
		icon: "i-mdi:server",
		category: "Adapters",
		status: "built-in",
	},
	{
		name: "Nitro adapter",
		description: "Reference Nitro server handlers and API routes.",
		icon: "i-mdi:fire",
		category: "Adapters",
		status: "built-in",
	},
	{
		name: "GraphQL adapter",
		description: "Render GraphQL queries, variables, and schema sections.",
		icon: "i-mdi:graphql",
		category: "Adapters",
		status: "built-in",
	},
	{
		name: "CLI adapter",
		description: "Document CLI commands, subcommands, and arguments.",
		icon: "i-mdi:console-line",
		category: "Adapters",
		status: "built-in",
	},
	{
		name: "@wrikka/create-docs-translate",
		description:
			"AI-powered docs translation driven from CI — scan docs, produce a translation plan, and write locale-prefixed markdown.",
		icon: "i-mdi:translate",
		install: "bun add -D @wrikka/create-docs",
		category: "AI",
		status: "beta",
	},
	{
		name: "MCP server",
		description:
			"Expose docs search and content as Model Context Protocol tools at /mcp.",
		icon: "i-mdi:robot-outline",
		category: "AI",
		status: "built-in",
	},
	{
		name: "LLM documentation",
		description:
			"Auto-generated /llms.txt and /llms-plugins.txt so AI agents can consume the docs.",
		icon: "i-mdi:text-box-outline",
		category: "AI",
		status: "built-in",
	},
	{
		name: "Ask AI",
		description:
			"Per-page AI assistant dialog that can answer questions about the current doc.",
		icon: "i-mdi:robot-happy-outline",
		category: "AI",
		status: "built-in",
	},
	{
		name: "GitHub integration",
		description:
			"Edit links, issue reporting, PR shortcuts, contributors, releases, and OAuth sign-in.",
		icon: "i-mdi:github",
		category: "Integrations",
		status: "built-in",
	},
	{
		name: "Analytics",
		description:
			"Local page-view tracking with a built-in /analytics dashboard and beacon endpoint support.",
		icon: "i-mdi:chart-box-outline",
		category: "Integrations",
		status: "built-in",
	},
	{
		name: "API diff",
		description:
			"Compare two API collections and render breaking changes at /api-diff.",
		icon: "i-mdi:file-compare",
		category: "Integrations",
		status: "built-in",
	},
	{
		name: "External search",
		description:
			"Algolia and MeiliSearch ports for replacing the built-in MiniSearch backend.",
		icon: "i-mdi:cloud-search-outline",
		category: "Integrations",
		status: "planned",
	},
	{
		name: "Comments",
		description: "Per-page comments via GitHub discussions (giscus-style).",
		icon: "i-mdi:comment-text-outline",
		category: "Integrations",
		status: "planned",
	},
	{
		name: "Diagrams & math",
		description: "Mermaid diagrams and KaTeX math blocks in markdown.",
		icon: "i-mdi:chart-timeline-variant",
		category: "Content",
		status: "planned",
	},
	{
		name: "PDF export",
		description: "Export the whole docs site (or a section) as a single PDF.",
		icon: "i-mdi:file-pdf-box",
		category: "Content",
		status: "planned",
	},
];
