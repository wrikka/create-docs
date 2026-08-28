/**
 * Domain events for API docs
 */
export interface ApiEndpointAddedEvent {
	readonly type: "API_ENDPOINT_ADDED";
	readonly timestamp: number;
	readonly path: string;
	readonly method: string;
}

export interface ApiEndpointUpdatedEvent {
	readonly type: "API_ENDPOINT_UPDATED";
	readonly timestamp: number;
	readonly path: string;
	readonly method: string;
}

export type ApiDocsDomainEvent =
	| ApiEndpointAddedEvent
	| ApiEndpointUpdatedEvent;

export const createApiEndpointAddedEvent = (
	path: string,
	method: string,
): ApiEndpointAddedEvent => ({
	type: "API_ENDPOINT_ADDED",
	timestamp: Date.now(),
	path,
	method,
});

export const createApiEndpointUpdatedEvent = (
	path: string,
	method: string,
): ApiEndpointUpdatedEvent => ({
	type: "API_ENDPOINT_UPDATED",
	timestamp: Date.now(),
	path,
	method,
});
