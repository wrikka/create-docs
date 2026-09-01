/**
 * Algolia adapter implementation.
 * Provides Algolia search integration via the REST API.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { ExternalSearchPort } from "../ports/external-search-port";
import type {
	ExternalSearchConfig,
	ExternalSearchResult,
} from "../types/search";

export const createAlgoliaAdapter = (
	appId: string,
	_apiKey: string,
): ExternalSearchPort => ({
	search: async (query: string, config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!appId) {
			throw configError("Algolia appId is required", {
				context: { query, config },
			});
		}

		if (!indexName) {
			throw configError("Algolia indexName is required", {
				context: { appId, query },
				hint: "Set indexName in the search config.",
			});
		}

		if (!apiKey) {
			throw configError("Algolia API key is required", {
				context: { appId, indexName, query },
				hint: "Pass the API key to createAlgoliaAdapter or set apiKey in config.",
			});
		}

		const searchHost = `https://${appId}-dsn.algolia.net`;
		const url = `${searchHost}/1/indexes/${encodeURIComponent(indexName)}/query`;
		const headers = {
			"X-Algolia-Application-Id": appId,
			"X-Algolia-API-Key": apiKey,
			"Content-Type": "application/json",
		};

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					params: `query=${encodeURIComponent(query)}&hitsPerPage=20`,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as {
				hits?: readonly ExternalSearchResult[];
			};
			return data.hits ?? [];
		} catch (error) {
			throw pluginError("Algolia search failed", {
				context: { query, config, error: String(error) },
			});
		}
	},

	index: async (docs: readonly unknown[], config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!appId) {
			throw configError("Algolia appId is required", {
				context: { config },
			});
		}

		if (!indexName) {
			throw configError("Algolia indexName is required", {
				context: { appId },
				hint: "Set indexName in the search config.",
			});
		}

		if (!apiKey) {
			throw configError("Algolia API key is required", {
				context: { appId, indexName },
				hint: "Pass the API key to createAlgoliaAdapter or set apiKey in config.",
			});
		}

		const writeHost = `https://${appId}.algolia.net`;
		const url = `${writeHost}/1/indexes/${encodeURIComponent(indexName)}/batch`;
		const headers = {
			"X-Algolia-Application-Id": appId,
			"X-Algolia-API-Key": apiKey,
			"Content-Type": "application/json",
		};

		const requests = docs.map((doc) => ({
			action: "addObject" as const,
			body: doc,
		}));

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({ requests }),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			throw pluginError("Algolia indexing failed", {
				context: {
					docCount: docs.length,
					config,
					error: String(error),
				},
			});
		}
	},

	clear: async (config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!appId) {
			throw configError("Algolia appId is required", {
				context: { config },
			});
		}

		if (!indexName) {
			throw configError("Algolia indexName is required", {
				context: { appId },
				hint: "Set indexName in the search config.",
			});
		}

		if (!apiKey) {
			throw configError("Algolia API key is required", {
				context: { appId, indexName },
				hint: "Pass the API key to createAlgoliaAdapter or set apiKey in config.",
			});
		}

		const writeHost = `https://${appId}.algolia.net`;
		const url = `${writeHost}/1/indexes/${encodeURIComponent(indexName)}/clear`;
		const headers = {
			"X-Algolia-Application-Id": appId,
			"X-Algolia-API-Key": apiKey,
			"Content-Type": "application/json",
		};

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: "{}",
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			throw pluginError("Algolia clear failed", {
				context: { config, error: String(error) },
			});
		}
	},
});
