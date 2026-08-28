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
): SearchRequestedEvent => ({
	type: "SEARCH_REQUESTED",
	timestamp: Date.now(),
	query,
	providerId,
});

export const createSearchCompletedEvent = (
	query: string,
	resultCount: number,
): SearchCompletedEvent => ({
	type: "SEARCH_COMPLETED",
	timestamp: Date.now(),
	query,
	resultCount,
});
