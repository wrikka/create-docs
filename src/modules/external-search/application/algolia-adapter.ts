/**
 * Algolia adapter implementation.
 * Provides Algolia search integration.
 */

import { pluginError } from "@create-docs/shared/errors";
import type { ExternalSearchPort } from "../ports/external-search-port";

export const createAlgoliaAdapter = (
	appId: string,
	_apiKey: string,
): ExternalSearchPort => ({
	search: async (query: string, config?: unknown) => {
		try {
			console.log(
				"Algolia search not yet implemented - requires algoliasearch dependency",
			);
			console.log(`App ID: ${appId}`);
			console.log(`Query: ${query}`);
			return [];
		} catch (error) {
			throw pluginError("Algolia search failed", {
				context: { query, config, error: String(error) },
			});
		}
	},

	index: async (docs: readonly unknown[], config?: unknown) => {
		try {
			console.log(
				"Algolia indexing not yet implemented - requires algoliasearch dependency",
			);
			console.log(`App ID: ${appId}`);
			console.log(`Document count: ${docs.length}`);
		} catch (error) {
			throw pluginError("Algolia indexing failed", {
				context: { docCount: docs.length, config, error: String(error) },
			});
		}
	},

	clear: async (config?: unknown) => {
		try {
			console.log(
				"Algolia clear not yet implemented - requires algoliasearch dependency",
			);
			console.log(`App ID: ${appId}`);
		} catch (error) {
			throw pluginError("Algolia clear failed", {
				context: { config, error: String(error) },
			});
		}
	},
});
