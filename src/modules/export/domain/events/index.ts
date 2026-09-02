/**
 * Domain events for export
 */
export interface ExportStartedEvent {
	readonly type: "EXPORT_STARTED";
	readonly timestamp: number;
	readonly format: string;
	readonly filename: string;
}

export interface ExportCompletedEvent {
	readonly type: "EXPORT_COMPLETED";
	readonly timestamp: number;
	readonly filePath: string;
}

export interface ExportFailedEvent {
	readonly type: "EXPORT_FAILED";
	readonly timestamp: number;
	readonly error: string;
}

export type ExportDomainEvent =
	| ExportStartedEvent
	| ExportCompletedEvent
	| ExportFailedEvent;

export const createExportStartedEvent = (
	format: string,
	filename: string,
	now: number = Date.now(),
): ExportStartedEvent => ({
	type: "EXPORT_STARTED",
	timestamp: now,
	format,
	filename,
});

export const createExportCompletedEvent = (
	filePath: string,
	now: number = Date.now(),
): ExportCompletedEvent => ({
	type: "EXPORT_COMPLETED",
	timestamp: now,
	filePath,
});

export const createExportFailedEvent = (
	error: string,
	now: number = Date.now(),
): ExportFailedEvent => ({
	type: "EXPORT_FAILED",
	timestamp: now,
	error,
});
