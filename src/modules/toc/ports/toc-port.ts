/**
 * Port for TOC operations.
 */

export type TocPort = {
	/**
	 * Extract headings from markdown content.
	 */
	readonly extractHeadings: (
		content: string,
		config: unknown,
	) => Promise<readonly unknown[]>;

	/**
	 * Generate TOC from headings.
	 */
	readonly generateToc: (
		headings: readonly unknown[],
		config: unknown,
	) => Promise<unknown>;
};
