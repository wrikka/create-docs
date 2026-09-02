/**
 * Domain events for external search
 */
export interface SearchRequestedEvent {
	readonly type: "SEARCH_REQUESTED";
	readonly timestamp: number;
	readonly query: string;
	readonly providerId: string;
}

export interface SearchCompletedEvent {
	readonly type: "SEARCH_COMPLETED";
	readonly timestamp: number;
	readonly query: string;
	readonly resultCount: number;
}

export type ExternalSearchDomainEvent =
	| SearchRequestedEvent
	| SearchCompletedEvent;

export const createSearchRequestedEvent = (
	query: string,
	providerId: string,
	now: number = Date.now(),
): SearchRequestedEvent => ({
	type: "SEARCH_REQUESTED",
	timestamp: now,
	query,
	providerId,
});

export const createSearchCompletedEvent = (
	query: string,
	resultCount: number,
	now: number = Date.now(),
): SearchCompletedEvent => ({
	type: "SEARCH_COMPLETED",
	timestamp: now,
	query,
	resultCount,
});
