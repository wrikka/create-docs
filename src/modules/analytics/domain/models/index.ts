/**
 * Domain models for analytics
 */
export interface PageView {
	readonly path: string;
	readonly timestamp: number;
	readonly duration?: number;
}

export interface SearchQuery {
	readonly query: string;
	readonly timestamp: number;
	readonly resultsCount: number;
}

export const createPageView = (
	path: string,
	options?: { duration?: number; timestamp?: number },
	now: number = Date.now(),
): PageView => ({
	path,
	timestamp: options?.timestamp ?? now,
	duration: options?.duration,
});

export const createSearchQuery = (
	query: string,
	resultsCount: number,
	options?: { timestamp?: number },
	now: number = Date.now(),
): SearchQuery => ({
	query,
	timestamp: options?.timestamp ?? now,
	resultsCount,
});
