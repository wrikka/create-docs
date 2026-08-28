/**
 * Default config — the canonical fallback for the docs site.
 */
import type { DocsConfig } from "../../types";

export const defaultDocsConfig: DocsConfig = {
	site: {
		title: "Documentation",
		description: "Documentation and guides",
		logo: "/logo.svg",
		github: "",
		twitter: "",
		version: "1.0.0",
	},
	nav: [
		{
			title: "Product",
			items: [
				{
					label: "Getting Started",
					href: "/docs/getting-started/introduction",
				},
				{ label: "Installation", href: "/docs/getting-started/installation" },
				{ label: "Features", href: "/docs/product/features" },
				{ label: "Configuration", href: "/docs/product/configuration" },
			],
		},
		{
			title: "Resources",
			items: [
				{ label: "FAQ", href: "/docs/resources/faq" },
				{ label: "Best Practices", href: "/docs/resources/best-practices" },
				{ label: "Troubleshooting", href: "/docs/resources/troubleshooting" },
				{ label: "Integrations", href: "/docs/resources/integrations" },
			],
		},
		{
			title: "API",
			items: [
				{ label: "Overview", href: "/docs/api/overview" },
				{ label: "Authentication", href: "/docs/api/authentication" },
				{ label: "Endpoints", href: "/docs/api/endpoints" },
				{ label: "API Tester", href: "/docs/api/tester" },
			],
		},
	],
	sidebar: [],
	theme: {
		primaryColor: "#3B82F6",
		darkMode: true,
		accentColor: "#8B5CF6",
		codeTheme: "github-dark",
	},
	api: {
		baseUrl: "/api/v1",
		authType: "bearer",
		authHeader: "Authorization",
		testerEnabled: true,
	},
	search: {
		enabled: true,
		placeholder: "Search docs...",
		shortcuts: ["⌘K", "Ctrl+K"],
	},
	editLink: {
		enabled: true,
		baseUrl: "",
		branch: "main",
	},
	lastUpdated: {
		enabled: true,
		format: "dd MMM yyyy",
	},
};
