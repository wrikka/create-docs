/**
 * Port for API docs operations.
 */

export type ApiDocsPort = {
	/**
	 * Extract API endpoints from source.
	 */
	readonly extractEndpoints: (
		sourcePath: string,
		config: unknown,
	) => Promise<readonly unknown[]>;

	/**
	 * Generate documentation from endpoints.
	 */
	readonly generateDocs: (
		endpoints: readonly unknown[],
		outputPath: string,
	) => Promise<void>;
};
