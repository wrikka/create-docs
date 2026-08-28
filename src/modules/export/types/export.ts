/**
 * Export types for PDF/EPUB export functionality.
 */

export type ExportConfig = {
	readonly format: "pdf" | "epub";
	readonly outputDir: string;
	readonly includeImages: boolean;
};

export type ExportResult = {
	readonly success: boolean;
	readonly outputPath: string;
	readonly error: string | null;
};
