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
}

export interface DocEntry {
	id: string;
	label: string;
	category: string;
	description: string;
	path: string;
	type: "rust" | "npm" | "api" | "md";
}

export interface DocContent {
	content: string;
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
