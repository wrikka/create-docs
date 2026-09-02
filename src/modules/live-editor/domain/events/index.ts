/**
 * Domain events for live editor
 */
export interface ContentChangedEvent {
	readonly type: "CONTENT_CHANGED";
	readonly timestamp: number;
	readonly contentLength: number;
}

export interface CursorMovedEvent {
	readonly type: "CURSOR_MOVED";
	readonly timestamp: number;
	readonly line: number;
	readonly column: number;
}

export type LiveEditorDomainEvent = ContentChangedEvent | CursorMovedEvent;

export const createContentChangedEvent = (
	contentLength: number,
	now: number = Date.now(),
): ContentChangedEvent => ({
	type: "CONTENT_CHANGED",
	timestamp: now,
	contentLength,
});

export const createCursorMovedEvent = (
	line: number,
	column: number,
	now: number = Date.now(),
): CursorMovedEvent => ({
	type: "CURSOR_MOVED",
	timestamp: now,
	line,
	column,
});
