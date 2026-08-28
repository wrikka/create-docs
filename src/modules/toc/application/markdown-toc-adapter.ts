/**
 * Markdown TOC adapter implementation.
 * Provides TOC generation from markdown content.
 */

import { parseError, pluginError } from "@create-docs/shared/errors";
import type { TocPort } from "../ports/toc-port";

export const createMarkdownTocAdapter = (): TocPort => ({
	extractHeadings: async (content: string, _config?: unknown) => {
		try {
			console.log(
				"Markdown TOC extraction not yet implemented - requires markdown parser",
			);
			console.log(`Content length: ${content.length} characters`);
			return [];
		} catch (error) {
			throw parseError("<input>", "Failed to extract headings", error);
		}
	},

	generateToc: async (headings: readonly unknown[], config?: unknown) => {
		try {
			console.log(
				"Markdown TOC generation not yet implemented - requires markdown parser",
			);
			console.log(`Headings count: ${headings.length}`);
			return {};
		} catch (error) {
			throw pluginError("Failed to generate TOC", {
				context: { config, error: String(error) },
			});
		}
	},
});
