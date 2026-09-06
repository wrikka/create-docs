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
		/** Small pill badge above the headline. */
		badge?: string;
		actions?: { text: string; link: string; theme?: "brand" | "alt" }[];
	};
	features?: HomeFeature[];
	/** Items for the horizontal feature slider. Defaults to `features`. */
	slides?: HomeFeature[];
}

/** A static API collection — endpoints parsed up front (OpenAPI/oRPC adapters). */
export interface ApiCollection extends CollectionMeta {
	type: "api";
	/** API style — shown as a badge on the reference pages. */
	style?: "rest" | "graphql" | "cli" | "rpc";
	endpoints: ApiEndpoint[];
}

export interface DocsAppFeatures {
	search?: boolean;
	askAi?: boolean;
	editLink?: boolean;
	lastUpdated?: boolean;
	toc?: boolean;
	aside?: boolean;
	themeToggle?: boolean;
	breadcrumbs?: boolean;
	reportIssue?: boolean;
	openPR?: boolean;
	rss?: boolean;
	sitemap?: boolean;
	pwa?: boolean;
	/** Local page-view analytics + /analytics dashboard. */
	analytics?: boolean;
	/** Show a toggle to reveal/hide the document frontmatter on doc pages. */
	frontmatterToggle?: boolean;
	/** Show an "MCP available" badge linking to the JSON-RPC endpoint. */
	mcp?: boolean;
}

export interface MarkdownConfig {
	engine?: "comark" | "marked";
}

/** A documentation version entry for the version switcher. */
export interface DocsVersion {
	/** Unique version id, e.g. "v2". */
	id: string;
	/** Display label, e.g. "v2 (latest)". */
	label: string;
	/** URL where this version is hosted — absolute URL or site path. Omit for the current site. */
	url?: string;
}

export interface VersionsConfig {
	/** Id of the version currently rendered. */
	current: string;
	list: DocsVersion[];
}

/** A locale entry for the language switcher. */
export interface LocaleInfo {
	/** BCP 47 language tag, e.g. "en", "th". */
	id: string;
	/** Display label, e.g. "English", "ไทย". */
	label: string;
	/** URL of the localized site (absolute or path). Omit for the current site. */
	url?: string;
}

export interface I18nConfig {
	/** BCP 47 tag of the current locale — also applied to `<html lang>`. */
	current: string;
	list: LocaleInfo[];
}

/** A plugin/integration entry shown on the `/plugins` marketplace page. */
export interface PluginInfo {
	/** Package name, e.g. "@wrikka/create-docs-openapi". */
	name: string;
	/** Short description of what the plugin provides. */
	description: string;
	/** Optional Iconify icon class, e.g. "i-mdi:api". */
	icon?: string;
	/** Optional link to docs or repository. */
	url?: string;
	/** Optional version/tag badge. */
	version?: string;
	/** Install command shown on the card, e.g. "bun add @wrikka/x". Omit for built-in integrations. */
	install?: string;
}

export interface ShowcaseInfo {
	/** Unique id for the showcase item. */
	id: string;
	/** Display label. */
	label: string;
	/** Short description. */
	description: string;
	/** Optional cover image URL. */
	image?: string;
	/** Optional Iconify icon class used as fallback. */
	icon?: string;
	/** Optional link to the project/case. */
	link?: string;
	/** Optional tags. */
	tags?: string[];
	/** Optional badge. */
	badge?: string;
}

export interface GitHubOAuthConfig {
	/** Set to false to hide the "Authorize with GitHub" flow. Defaults to true. */
	enabled?: boolean;
	/**
	 * Optional public OAuth client id. The real client id/secret are resolved
	 * server-side via `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` secrets, so
	 * this is not required by the client.
	 */
	clientId?: string;
	/** OAuth callback URL. Defaults to `${location.origin}/auth/github/callback`. */
	redirectUri?: string;
	/** Requested OAuth scopes. Defaults to "repo". */
	scope?: string;
}

export interface GitHubConfig {
	owner: string;
	repo: string;
	branch?: string;
	stats?: boolean;
	releases?: boolean;
	contributors?: boolean;
	issues?: boolean;
	oauth?: GitHubOAuthConfig;
}

export interface SiteLink {
	label: string;
	to: string;
	icon?: string;
}

export interface FooterConfig {
	copyright?: string;
	links?: SiteLink[];
}

export interface AnnouncementConfig {
	text: string;
	to?: string;
	closable?: boolean;
}

export interface SiteConfig {
	title: string;
	description?: string;
	repoUrl?: string;
	url?: string;
	ogImage?: string;
	/** Optional logo icon class. */
	logo?: string;
	/** Optional social / external links. */
	social?: {
		npm?: string;
		twitter?: string;
		discord?: string;
		youtube?: string;
		mastodon?: string;
	};
}

export interface DocsAppConfig {
	site: SiteConfig;
	/** GitHub integration options. */
	github?: GitHubConfig;
	/** Injected data source for markdown doc collections. */
	dataSource: import("./types").DocsDataSource;
	/** Default collection used for "/" redirect when no home config. */
	defaultCollection?: string;
	/** VitePress-style home page. When set, "/" renders the home layout. */
	home?: HomeConfig;
	/** API reference collections (Scalar-style). */
	apiCollections?: ApiCollection[];
	/**
	 * API diff/changelog: a snapshot of previous API collections to compare
	 * against `apiCollections`. Enables the `/api-diff` page.
	 */
	apiDiff?: { previous: ApiCollection[] };
	features?: DocsAppFeatures;
	/** Markdown rendering engine configuration. */
	markdown?: MarkdownConfig;
	/** Versioned docs: shows a version switcher when more than one entry is listed. */
	versions?: VersionsConfig;
	/** Multi-language docs: shows a language switcher and sets `<html lang>`. */
	i18n?: I18nConfig;
	/** Optional analytics sink: page views are beaconed to this endpoint. */
	analytics?: { endpoint?: string };
	/** Plugin marketplace: entries listed on the `/plugins` page. */
	plugins?: PluginInfo[];
	/** Showcase / featured-work grid used by the `/showcase` page. */
	showcase?: ShowcaseInfo[];
	theme?: { defaultMode?: "dark" | "light" };
	/** Optional fixed announcement banner. */
	announcement?: AnnouncementConfig;
	/** Optional footer configuration. */
	footer?: FooterConfig;
	/** Optional top navigation links. */
	topNav?: SiteLink[];
}
