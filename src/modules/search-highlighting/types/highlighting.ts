/**
 * Search highlighting types for highlighting search terms in content.
 */

export type HighlightConfig = {
	readonly enabled: boolean;
	readonly highlightClass: string;
	readonly caseSensitive: boolean;
};

export type HighlightMatch = {
	readonly text: string;
	readonly start: number;
	readonly end: number;
};
