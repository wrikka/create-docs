/**
 * TOC Generator Ports
 *
 * Module-specific interfaces for TOC generation
 */

import type { TocItem, TocOptions } from "../types";

/**
 * Content parser interface
 */
export interface ContentParser {
	/** Parse content and return headings */
	parseHeadings(
		content: string,
	): Promise<{ text: string; level: number; line: number }[]>;
}

// Re-export types for convenience
export type { TocItem, TocOptions };
