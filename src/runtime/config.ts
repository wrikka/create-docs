import type { ApiEndpoint, CollectionMeta } from "./types";

export interface HomeFeature {
	icon?: string;
	title: string;
	details?: string;
	link?: string;
}

export interface HomeConfig {
	hero?: {
		name?: string;
		text?: string;
		tagline?: string;
		actions?: { text: string; link: string; theme?: "brand" | "alt" }[];
	};
	features?: HomeFeature[];
}

/** A static API collection — endpoints parsed up front (OpenAPI/oRPC adapters). */
export interface ApiCollection extends CollectionMeta {
	type: "api";
	endpoints: ApiEndpoint[];
}

export interface DocsAppFeatures {
	search?: boolean;
	askAi?: boolean;
	editLink?: boolean;
	themeToggle?: boolean;
}

export interface MarkdownConfig {
	engine?: "comark" | "marked";
}

export interface DocsAppConfig {
	site: { title: string; description?: string; repoUrl?: string };
	/** Injected data source for markdown doc collections. */
	dataSource: import("./types").DocsDataSource;
	/** Default collection used for "/" redirect when no home config. */
	defaultCollection?: string;
	/** VitePress-style home page. When set, "/" renders the home layout. */
	home?: HomeConfig;
	/** API reference collections (Scalar-style). */
	apiCollections?: ApiCollection[];
	features?: DocsAppFeatures;
	/** Markdown rendering engine configuration. */
	markdown?: MarkdownConfig;
	theme?: { defaultMode?: "dark" | "light" };
}
