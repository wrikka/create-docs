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
	/** Optional repository URL used by "Edit on GitHub" etc. */
	repoUrl?: string;
	/** "docs" renders markdown pages, "api" renders the API reference layout, "showcase" renders cards. */
	type?: "docs" | "api" | "showcase";
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

/** One Markdown document. */
export interface DocContent {
	id: string;
	label: string;
	/** Body may be omitted in lightweight entries. */
	content?: string;
	category?: string;
	order?: number;
	icon?: string;
	/** Optional badge shown in sidebar and search. */
	badge?: string;
	description?: string;
	path?: string;
	/** Optional tags for grouping/filtering. */
	tags?: string[];
	/** ISO date if available. */
	date?: string;
	/** Last-updated ISO timestamp. */
	lastUpdated?: string;
	/** Frontmatter values parsed from the file. */
	frontmatter?: DocFrontmatter;
}

export interface DocEntry extends DocContent {
	/** Sidebar category (required for grouping). */
	category: string;
	/** Short description. */
	description: string;
	/** Original file path / route path. */
	path: string;
	/** Support nested sidebar submenus. */
	children?: DocEntry[];
	/** Excluded from listings when the source filters drafts. */
	draft?: boolean;
	/** Original publication timestamp (ISO). */
	publishedAt?: string;
	/** Per-page SEO overrides. */
	seo?: DocSeo;
	/** Entry render type. */
	type?: "doc" | "api" | "showcase" | "rust" | "npm" | "md";
	/** Nav entries may omit the full body content. */
	content?: string;
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

/** Search result returned from buildSearchIndex(). */
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
	cost?: { tokens?: number; ms?: number };
}

/** Port — the app shell only talks to this interface. */
export interface DocsDataSource {
	/** Available collections. */
	collections(): Promise<CollectionMeta[]> | CollectionMeta[];
	/** List all documents in a collection. */
	list(collection: string): Promise<DocEntry[]> | DocEntry[];
	/** Fetch a single document. */
	get(collection: string, id: string): Promise<DocContent> | DocContent;
	/** Optional full-text search across collections. */
	search?(
		q: string,
		collection?: string,
	): Promise<SearchResult[]> | SearchResult[];
	/** Optional — enables the Ask AI button when present. */
	ask?(input: AskInput): Promise<AskResult> | AskResult;
	/** Optional — Nuxt Content-style filtered/sorted document listing. */
	query?(q: DocQuery): Promise<DocEntry[]> | DocEntry[];
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

export interface GraphQlEndpoint {
	/** GraphQL operation name. */
	operation?: string;
	/** GraphQL query or mutation. */
	query: string;
	/** Example / schema for variables. */
	variables?: Record<string, unknown>;
}

export interface CliArg {
	name: string;
	required: boolean;
	description?: string;
	example?: string;
}

export interface CliEndpoint {
	/** Base command, e.g. "wrikka". */
	command: string;
	/** Subcommand, e.g. "create". */
	subcommand?: string;
	args?: CliArg[];
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
	/** GraphQL-specific payload. */
	graphql?: GraphQlEndpoint;
	/** CLI-specific payload. */
	cli?: CliEndpoint;
}
