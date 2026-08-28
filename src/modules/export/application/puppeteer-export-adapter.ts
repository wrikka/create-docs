/**
 * Puppeteer export adapter implementation.
 * Provides PDF/EPUB export using Puppeteer.
 */

import { processExportResult } from "../domain/operations/export-operations";
import type { ExportPort } from "../ports/export-port";
import type { ExportConfig } from "../types/export";

export const createPuppeteerExportAdapter = (): ExportPort => ({
	exportToPdf: async (_content: string, config?: unknown) => {
		try {
			if (typeof window === "undefined") {
				console.error("PDF export requires browser environment");
				return processExportResult(false, "", "Browser environment required");
			}

			const exportConfig = config as ExportConfig;
			if (!exportConfig?.outputDir) {
				return processExportResult(false, "", "Output directory not specified");
			}

			console.log(
				"PDF export not yet implemented - requires Puppeteer dependency",
			);
			return processExportResult(false, "", "Puppeteer not installed");
		} catch (error) {
			return processExportResult(
				false,
				"",
				error instanceof Error ? error.message : "Unknown error",
			);
		}
	},

	exportToEpub: async (_content: string, config?: unknown) => {
		try {
			if (typeof window === "undefined") {
				console.error("EPUB export requires browser environment");
				return processExportResult(false, "", "Browser environment required");
			}

			const exportConfig = config as ExportConfig;
			if (!exportConfig?.outputDir) {
				return processExportResult(false, "", "Output directory not specified");
			}

			console.log(
				"EPUB export not yet implemented - requires Puppeteer dependency",
			);
			return processExportResult(false, "", "Puppeteer not installed");
		} catch (error) {
			return processExportResult(
				false,
				"",
				error instanceof Error ? error.message : "Unknown error",
			);
		}
	},
});
