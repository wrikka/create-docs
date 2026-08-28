/**
 * Port for locale loading operations.
 */

export type LocaleLoaderPort = {
	/**
	 * Scan docs directory for locale-specific folders.
	 */
	readonly scanLocales: (docsDir: string) => Promise<readonly string[]>;

	/**
	 * Load docs for a specific locale.
	 */
	readonly loadLocaleDocs: (
		locale: string,
		docsDir: string,
	) => Promise<readonly string[]>;
};
