/**
 * Ambient type declarations for the `virtual:docs/*` modules.
 * Import this from your tsconfig (or include it in your project's types)
 * to get full autocomplete on the virtual module imports.
 */
declare module "virtual:docs/data" {
	import type { DocPage } from "@create-docs/modules/content";
	export const docsData: ReadonlyArray<{
		id: string;
		slug: string;
		title: string;
		description?: string;
		frontmatter: DocPage["frontmatter"];
		rawContent: string;
		content: string;
		filePath: string;
	}>;
}

declare module "virtual:docs/sidebar" {
	import type { SidebarGroup } from "@create-docs/modules/navigation";
	export const sidebar: readonly SidebarGroup[];
}

declare module "virtual:docs/nav" {
	import type { NavSection } from "@create-docs/modules/navigation";
	export const nav: readonly NavSection[];
}

declare module "virtual:docs/search-index" {
	import type { SearchEntry } from "@create-docs/modules/search";
	export const searchIndex: readonly SearchEntry[];
}

declare module "virtual:docs/config" {
	import type { ResolvedDocsConfig } from "@create-docs/modules/config";
	export const docsConfig: ResolvedDocsConfig;
	export const site: ResolvedDocsConfig["site"];
	export const nav: ResolvedDocsConfig["nav"];
	export const sidebar: ResolvedDocsConfig["sidebar"];
	export const api: ResolvedDocsConfig["api"];
	export const search: ResolvedDocsConfig["search"];
	export const editLink: ResolvedDocsConfig["editLink"];
	export const lastUpdated: ResolvedDocsConfig["lastUpdated"];
}
