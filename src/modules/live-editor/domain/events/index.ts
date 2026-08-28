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
): ContentChangedEvent => ({
	type: "CONTENT_CHANGED",
	timestamp: Date.now(),
	contentLength,
});

export const createCursorMovedEvent = (
	line: number,
	column: number,
): CursorMovedEvent => ({
	type: "CURSOR_MOVED",
	timestamp: Date.now(),
	line,
	column,
});
