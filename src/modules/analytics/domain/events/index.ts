/**
 * Domain events for analytics
 */
export interface PageViewedEvent {
	readonly type: "PAGE_VIEWED";
	readonly timestamp: number;
	readonly path: string;
}

export interface SearchPerformedEvent {
	readonly type: "SEARCH_PERFORMED";
	readonly timestamp: number;
	readonly query: string;
	readonly resultsCount: number;
}

export type AnalyticsDomainEvent = PageViewedEvent | SearchPerformedEvent;

export const createPageViewedEvent = (path: string): PageViewedEvent => ({
	type: "PAGE_VIEWED",
	timestamp: Date.now(),
	path,
});

export const createSearchPerformedEvent = (
	query: string,
	resultsCount: number,
): SearchPerformedEvent => ({
	type: "SEARCH_PERFORMED",
	timestamp: Date.now(),
	query,
	resultsCount,
});
