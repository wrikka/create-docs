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

export const createPageViewedEvent = (
	path: string,
	now: number = Date.now(),
): PageViewedEvent => ({
	type: "PAGE_VIEWED",
	timestamp: now,
	path,
});

export const createSearchPerformedEvent = (
	query: string,
	resultsCount: number,
	now: number = Date.now(),
): SearchPerformedEvent => ({
	type: "SEARCH_PERFORMED",
	timestamp: now,
	query,
	resultsCount,
});
