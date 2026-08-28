/**
 * MeiliSearch adapter implementation.
 * Provides MeiliSearch search integration.
 */

import { pluginError } from "@create-docs/shared/errors";
import type { ExternalSearchPort } from "../ports/external-search-port";

export const createMeilisearchAdapter = (
	host: string,
	_apiKey: string,
): ExternalSearchPort => ({
	search: async (query: string, config?: unknown) => {
		try {
			console.log(
				"MeiliSearch search not yet implemented - requires meilisearch-js dependency",
			);
			console.log(`Host: ${host}`);
			console.log(`Query: ${query}`);
			return [];
		} catch (error) {
			throw pluginError("MeiliSearch search failed", {
				context: { query, config, host, error: String(error) },
			});
		}
	},

	index: async (docs: readonly unknown[], config?: unknown) => {
		try {
			console.log(
				"MeiliSearch indexing not yet implemented - requires meilisearch-js dependency",
			);
			console.log(`Host: ${host}`);
			console.log(`Document count: ${docs.length}`);
		} catch (error) {
			throw pluginError("MeiliSearch indexing failed", {
				context: { docCount: docs.length, config, host, error: String(error) },
			});
		}
	},

	clear: async (config?: unknown) => {
		try {
			console.log(
				"MeiliSearch clear not yet implemented - requires meilisearch-js dependency",
			);
			console.log(`Host: ${host}`);
		} catch (error) {
			throw pluginError("MeiliSearch clear failed", {
				context: { config, host, error: String(error) },
			});
		}
	},
});
