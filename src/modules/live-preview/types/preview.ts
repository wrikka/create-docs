/**
 * Live preview types for real-time markdown preview.
 */

export type PreviewState = {
	readonly isPreviewing: boolean;
	readonly currentPath: string;
	readonly content: string;
	readonly error: Error | null;
};

export type PreviewConfig = {
	readonly enabled: boolean;
	readonly splitView: boolean;
	readonly syncScroll: boolean;
};
