/**
 * Domain models for export
 */
export interface ExportConfig {
	readonly format: "pdf" | "html" | "markdown" | "json";
	readonly includeImages: boolean;
	readonly includeCodeBlocks: boolean;
	readonly filename: string;
}

export interface ExportResult {
	readonly success: boolean;
	readonly filePath?: string;
	readonly error?: string;
	readonly timestamp: number;
}

export const createExportConfig = (
	format: ExportConfig["format"],
	filename: string,
	options?: { includeImages?: boolean; includeCodeBlocks?: boolean },
): ExportConfig => ({
	format,
	filename,
	includeImages: options?.includeImages ?? true,
	includeCodeBlocks: options?.includeCodeBlocks ?? true,
});

export const createExportResult = (
	success: boolean,
	options?: { filePath?: string; error?: string; timestamp?: number },
	now: number = Date.now(),
): ExportResult => ({
	success,
	filePath: options?.filePath,
	error: options?.error,
	timestamp: options?.timestamp ?? now,
});
