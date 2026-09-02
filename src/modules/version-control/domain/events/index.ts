/**
 * Domain events for version control
 */
export interface VersionCreatedEvent {
	readonly type: "VERSION_CREATED";
	readonly timestamp: number;
	readonly versionNumber: string;
	readonly author: string;
}

export interface VersionRestoredEvent {
	readonly type: "VERSION_RESTORED";
	readonly timestamp: number;
	readonly versionNumber: string;
}

export type VersionControlDomainEvent =
	| VersionCreatedEvent
	| VersionRestoredEvent;

export const createVersionCreatedEvent = (
	versionNumber: string,
	author: string,
	now: number = Date.now(),
): VersionCreatedEvent => ({
	type: "VERSION_CREATED",
	timestamp: now,
	versionNumber,
	author,
});

export const createVersionRestoredEvent = (
	versionNumber: string,
	now: number = Date.now(),
): VersionRestoredEvent => ({
	type: "VERSION_RESTORED",
	timestamp: now,
	versionNumber,
});
