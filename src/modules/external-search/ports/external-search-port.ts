/**
 * Port for external search operations.
 */

export type ExternalSearchPort = {
	/**
	 * Search external index.
	 */
	readonly search: (
		query: string,
		config: unknown,
	) => Promise<readonly unknown[]>;

	/**
	 * Index documents to external search.
	 */
	readonly index: (docs: readonly unknown[], config: unknown) => Promise<void>;

	/**
	 * Clear external index.
	 */
	readonly clear: (config: unknown) => Promise<void>;
};
