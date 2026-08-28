/**
 * Pure export operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { ExportConfig, ExportResult } from "../../types/export";

export type ExportError = {
	readonly kind: "export-error";
	readonly message: string;
};

/**
 * Validate export config.
 */
export const validateExportConfig = (config: ExportConfig): boolean => {
	if (!config.format) return false;
	if (!config.outputDir) return false;
	return true;
};

/**
 * Generate export filename.
 */
export const generateExportFilename = (
	slug: string,
	format: "pdf" | "epub",
): string => {
	const timestamp = new Date().toISOString().split("T")[0];
	return `${slug}-${timestamp}.${format}`;
};

/**
 * Process export result.
 */
export const processExportResult = (
	success: boolean,
	outputPath: string,
	error: string | null,
): Result<ExportResult, ExportError> => {
	try {
		return ok({
			success,
			outputPath,
			error,
		});
	} catch (error) {
		return err({
			kind: "export-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
