/**
 * Port for export operations.
 */

export type ExportPort = {
	/**
	 * Export documentation to PDF.
	 */
	readonly exportToPdf: (content: string, config: unknown) => Promise<unknown>;

	/**
	 * Export documentation to EPUB.
	 */
	readonly exportToEpub: (content: string, config: unknown) => Promise<unknown>;
};
