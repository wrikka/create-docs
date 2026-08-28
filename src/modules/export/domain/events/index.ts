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
): ExportStartedEvent => ({
	type: "EXPORT_STARTED",
	timestamp: Date.now(),
	format,
	filename,
});

export const createExportCompletedEvent = (
	filePath: string,
): ExportCompletedEvent => ({
	type: "EXPORT_COMPLETED",
	timestamp: Date.now(),
	filePath,
});

export const createExportFailedEvent = (error: string): ExportFailedEvent => ({
	type: "EXPORT_FAILED",
	timestamp: Date.now(),
	error,
});
