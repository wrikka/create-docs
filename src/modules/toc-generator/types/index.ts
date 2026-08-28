/**
 * TOC Generator Types
 *
 * Domain types for table of contents generation
 */

/**
 * TOC item
 */
export interface TocItem {
	/** Heading text */
	text: string;
	/** Heading level (1-6) */
	level: number;
	/** Anchor ID */
	id: string;
	/** Child items */
	children?: TocItem[];
}

/**
 * TOC options
 */
export interface TocOptions {
	/** Max depth */
	maxDepth?: number;
	/** Min depth */
	minDepth?: number;
	/** Include headings */
	include?: string[];
	/** Exclude headings */
	exclude?: string[];
}

/**
 * Heading
 */
export interface Heading {
	/** Heading text */
	text: string;
	/** Heading level */
	level: number;
	/** Line number */
	line: number;
}

/** Content parser port */
export interface ContentParser {
	parse: (raw: string) => unknown;
}
