/**
 * Port for search highlighting operations.
 */

export type HighlightingPort = {
	/**
	 * Highlight search terms in content.
	 */
	readonly highlight: (
		content: string,
		query: string,
		config: unknown,
	) => Promise<string>;
};
