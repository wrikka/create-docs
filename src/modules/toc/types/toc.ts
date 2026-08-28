/**
 * Table of Contents types for enhanced TOC features.
 */

export type TocConfig = {
	readonly enabled: boolean;
	readonly maxDepth: number;
	readonly minHeadingLevel: number;
	readonly includeSubheadings: boolean;
};

export type TocItemEnhanced = {
	readonly id: string;
	readonly text: string;
	readonly level: number;
	children?: TocItemEnhanced[];
};
