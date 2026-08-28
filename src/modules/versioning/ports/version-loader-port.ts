/**
 * Port for version loading operations.
 */

export type VersionLoaderPort = {
	/**
	 * Scan docs directory for version-specific folders.
	 */
	readonly scanVersions: (docsDir: string) => Promise<readonly string[]>;

	/**
	 * Load docs for a specific version.
	 */
	readonly loadVersionDocs: (
		version: string,
		docsDir: string,
	) => Promise<readonly string[]>;
};
