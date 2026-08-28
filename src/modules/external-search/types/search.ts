/**
 * External search types for Algolia/MeiliSearch integration.
 */

export type ExternalSearchConfig = {
	readonly provider: "algolia" | "meilisearch" | "local";
	readonly appId?: string;
	readonly apiKey?: string;
	readonly indexName?: string;
	readonly host?: string;
};

export type ExternalSearchResult = {
	readonly id: string;
	readonly title: string;
	readonly description?: string;
	readonly url: string;
	readonly score?: number;
};
