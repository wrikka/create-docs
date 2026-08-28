/**
 * Domain events for code block enhancements
 */
export interface CodeBlockCopiedEvent {
	readonly type: "CODE_BLOCK_COPIED";
	readonly timestamp: number;
	readonly blockId: string;
}

export interface CodeBlockDownloadedEvent {
	readonly type: "CODE_BLOCK_DOWNLOADED";
	readonly timestamp: number;
	readonly blockId: string;
	readonly filename: string;
}

export interface LineHighlightedEvent {
	readonly type: "LINE_HIGHLIGHTED";
	readonly timestamp: number;
	readonly blockId: string;
	readonly lineNumber: number;
}

export type CodeBlockEnhancementsDomainEvent =
	| CodeBlockCopiedEvent
	| CodeBlockDownloadedEvent
	| LineHighlightedEvent;

export const createCodeBlockCopiedEvent = (
	blockId: string,
): CodeBlockCopiedEvent => ({
	type: "CODE_BLOCK_COPIED",
	timestamp: Date.now(),
	blockId,
});

export const createCodeBlockDownloadedEvent = (
	blockId: string,
	filename: string,
): CodeBlockDownloadedEvent => ({
	type: "CODE_BLOCK_DOWNLOADED",
	timestamp: Date.now(),
	blockId,
	filename,
});

export const createLineHighlightedEvent = (
	blockId: string,
	lineNumber: number,
): LineHighlightedEvent => ({
	type: "LINE_HIGHLIGHTED",
	timestamp: Date.now(),
	blockId,
	lineNumber,
});
