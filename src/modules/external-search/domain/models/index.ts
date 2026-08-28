/**
 * Domain models for external search
 */
export interface SearchProvider {
	readonly id: string;
	readonly name: string;
	readonly endpoint: string;
	readonly enabled: boolean;
}

export interface SearchResult {
	readonly providerId: string;
	readonly title: string;
	readonly url: string;
	readonly snippet?: string;
	readonly relevance: number;
}

export const createSearchProvider = (
	id: string,
	name: string,
	endpoint: string,
	enabled: boolean = true,
): SearchProvider => ({
	id,
	name,
	endpoint,
	enabled,
});

export const createSearchResult = (
	providerId: string,
	title: string,
	url: string,
	options?: { snippet?: string; relevance?: number },
): SearchResult => ({
	providerId,
	title,
	url,
	snippet: options?.snippet,
	relevance: options?.relevance ?? 0,
});
