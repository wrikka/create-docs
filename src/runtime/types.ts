/** One Markdown document. */
export interface DocContent {
	id: string;
	label: string;
	content: string;
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
	frontmatter?: Record<string, unknown>;
}

export interface DocEntry extends DocContent {
	/** Support nested sidebar submenus. */
	children?: DocEntry[];
	type?: "doc" | "api" | "showcase";
}

/** Minimal collection metadata. */
export interface CollectionMeta {
	id: string;
	label: string;
	icon?: string;
	description?: string;
	/** Collection type used to switch rendering. */
	type?: "docs" | "api" | "showcase";
}

/** Search result returned from buildSearchIndex(). */
export interface SearchResult {
	collection: string;
	id: string;
	title: string;
	snippet: string;
	score: number;
}

export interface DocsDataSource {
	/** Available collections. */
	collections(): Promise<CollectionMeta[]> | CollectionMeta[];
	/** List all documents in a collection. */
	list(collection: string): Promise<DocEntry[]> | DocEntry[];
	/** Fetch a single document. */
	get(collection: string, id: string): Promise<DocContent> | DocContent;
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
