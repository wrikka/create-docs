/**
 * Runtime types for the create-docs Solid app shell.
 *
 * A consumer injects a {@link DocsDataSource} so the UI stays
 * source-agnostic: oRPC, static manifest, CMS, anything.
 */

export interface CollectionMeta {
	id: string;
	label: string;
	icon?: string;
	description?: string;
	repoUrl?: string;
	/** "docs" renders markdown pages, "api" renders the API reference layout. */
	type?: "docs" | "api";
	/** Sidebar sections (from `_dir.yml` or manual config) — ordered nav groups. */
	sections?: {
		id: string;
		label: string;
		icon?: string;
		order?: number;
		collapsed?: boolean;
	}[];
}

export interface DocSeo {
	title?: string;
	description?: string;
	image?: string;
	ogType?: "article" | "website";
	noIndex?: boolean;
}

/** Frontmatter parsed from a markdown document. */
export interface DocFrontmatter {
	title?: string;
	description?: string;
	/** Sort order within the sidebar/category. */
	order?: number;
	/** Sidebar category override. */
	category?: string;
	/** Hide from lists, search, sitemap and feeds (still renderable in dev). */
	draft?: boolean;
	/** ISO date — doc is hidden until this time (scheduled publishing). */
	publishedAt?: string;
	/** ISO date — shown as "last updated". */
	lastUpdated?: string;
	tags?: string[];
	/** Small badge shown next to the sidebar label. */
	badge?: string;
	/** Iconify icon class for the sidebar entry. */
	icon?: string;
	/** Page-level overrides. */
	toc?: boolean;
	aside?: boolean;
	editLink?: boolean;
	layout?: "doc" | "page" | "home";
	/** Per-page SEO overrides. */
	seo?: DocSeo;
	[key: string]: unknown;
}

export interface DocEntry {
	id: string;
	label: string;
	category: string;
	description: string;
	path: string;
	/** Optional last updated ISO timestamp. */
	lastUpdated?: string;
	/** Original publication timestamp (ISO). */
	publishedAt?: string;
	/** Sidebar ordering hint. */
	order?: number;
	tags?: string[];
	/** Sidebar badge text. */
	badge?: string;
	/** Sidebar icon class. */
	icon?: string;
	/** Excluded from listings when the source filters drafts. */
	draft?: boolean;
	/** Per-page SEO overrides. */
	seo?: DocSeo;
	type: "rust" | "npm" | "api" | "md";
}

export interface DocContent {
	content: string;
	frontmatter?: DocFrontmatter;
}

/** Nuxt Content-style query over a data source. */
export interface DocQuery {
	collection?: string;
	/** Filters — all provided fields must match. */
	where?: {
		category?: string;
		tag?: string;
		draft?: boolean;
	};
	sort?: "title" | "order" | "lastUpdated" | "id";
	order?: "asc" | "desc";
	limit?: number;
}

export interface SearchResult {
	collection: string;
	id: string;
	title: string;
	snippet: string;
	score: number;
}

export interface AskInput {
	collection: string;
	id: string;
	question: string;
}

export interface AskResult {
	answer: string;
}

/** Port — the app shell only talks to this interface. */
export interface DocsDataSource {
	collections(): Promise<CollectionMeta[]>;
	list(collection: string): Promise<DocEntry[]>;
	get(collection: string, id: string): Promise<DocContent>;
	search(q: string, collection?: string): Promise<SearchResult[]>;
	/** Optional — enables the Ask AI button when present. */
	ask?(input: AskInput): Promise<AskResult>;
	/** Optional — Nuxt Content-style filtered/sorted document listing. */
	query?(q: DocQuery): Promise<DocEntry[]>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiParameter {
	name: string;
	in: "query" | "path" | "header" | "cookie";
	required: boolean;
	description?: string;
	schema?: unknown;
	example?: unknown;
}

export interface ApiEndpoint {
	id: string;
	method: HttpMethod;
	path: string;
	summary?: string;
	description?: string;
	tag?: string;
	parameters: ApiParameter[];
	requestBody?: {
		description?: string;
		required: boolean;
		example?: unknown;
		contentType?: string;
	};
	responses: Record<string, { description: string; example?: unknown }>;
	/** Absolute base URL used by the playground. Defaults to origin. */
	server?: string;
}
