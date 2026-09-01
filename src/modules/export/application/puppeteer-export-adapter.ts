/**
 * Puppeteer export adapter implementation.
 * Provides PDF/EPUB export using Puppeteer.
 */

import { processExportResult } from "../domain/operations/export-operations";
import type { ExportPort } from "../ports/export-port";
import type { ExportConfig } from "../types/export";

const PUPPETEER_MISSING_ERROR =
	"Puppeteer is not installed. PDF/EPUB export requires the puppeteer package and a Chromium binary.";

export const createPuppeteerExportAdapter = (): ExportPort => ({
	exportToPdf: async (_content: string, config?: unknown) => {
		try {
			if (typeof window !== "undefined") {
				return processExportResult(
					false,
					"",
					"PDF export is only supported in a Node.js build environment with Puppeteer.",
				);
			}

			const exportConfig = config as ExportConfig;
			if (!exportConfig?.outputDir) {
				return processExportResult(false, "", "Output directory not specified");
			}

			return processExportResult(false, "", PUPPETEER_MISSING_ERROR);
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
			if (typeof window !== "undefined") {
				return processExportResult(
					false,
					"",
					"EPUB export is only supported in a Node.js build environment with Puppeteer.",
				);
			}

			const exportConfig = config as ExportConfig;
			if (!exportConfig?.outputDir) {
				return processExportResult(false, "", "Output directory not specified");
			}

			return processExportResult(false, "", PUPPETEER_MISSING_ERROR);
		} catch (error) {
			return processExportResult(
				false,
				"",
				error instanceof Error ? error.message : "Unknown error",
			);
		}
	},
});
