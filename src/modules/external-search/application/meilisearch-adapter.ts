/**
 * MeiliSearch adapter implementation.
 * Provides MeiliSearch search integration via the REST API.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { ExternalSearchPort } from "../ports/external-search-port";
import type {
	ExternalSearchConfig,
	ExternalSearchResult,
} from "../types/search";

export const createMeilisearchAdapter = (
	host: string,
	_apiKey: string,
): ExternalSearchPort => ({
	search: async (query: string, config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const resolvedHost = (cfg?.host ?? host).replace(/\/+$/, "");
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!resolvedHost) {
			throw configError("MeiliSearch host is required", {
				context: { query, config },
				hint: "Pass host to createMeilisearchAdapter or set host in config.",
			});
		}

		if (!indexName) {
			throw configError("MeiliSearch indexName is required", {
				context: { host: resolvedHost, query },
				hint: "Set indexName in the search config.",
			});
		}

		const url = `${resolvedHost}/indexes/${encodeURIComponent(indexName)}/search`;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (apiKey) {
			headers.Authorization = `Bearer ${apiKey}`;
		}

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({ q: query, limit: 20 }),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = (await response.json()) as {
				hits?: readonly ExternalSearchResult[];
			};
			return data.hits ?? [];
		} catch (error) {
			throw pluginError("MeiliSearch search failed", {
				context: { query, config, host: resolvedHost, error: String(error) },
			});
		}
	},

	index: async (docs: readonly unknown[], config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const resolvedHost = (cfg?.host ?? host).replace(/\/+$/, "");
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!resolvedHost) {
			throw configError("MeiliSearch host is required", {
				context: { config },
				hint: "Pass host to createMeilisearchAdapter or set host in config.",
			});
		}

		if (!indexName) {
			throw configError("MeiliSearch indexName is required", {
				context: { host: resolvedHost },
				hint: "Set indexName in the search config.",
			});
		}

		const url = `${resolvedHost}/indexes/${encodeURIComponent(indexName)}/documents`;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (apiKey) {
			headers.Authorization = `Bearer ${apiKey}`;
		}

		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(docs),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			throw pluginError("MeiliSearch indexing failed", {
				context: {
					docCount: docs.length,
					config,
					host: resolvedHost,
					error: String(error),
				},
			});
		}
	},

	clear: async (config?: unknown) => {
		const cfg = config as Partial<ExternalSearchConfig> | undefined;
		const resolvedHost = (cfg?.host ?? host).replace(/\/+$/, "");
		const indexName = cfg?.indexName;
		const apiKey = cfg?.apiKey ?? _apiKey;

		if (!resolvedHost) {
			throw configError("MeiliSearch host is required", {
				context: { config },
				hint: "Pass host to createMeilisearchAdapter or set host in config.",
			});
		}

		if (!indexName) {
			throw configError("MeiliSearch indexName is required", {
				context: { host: resolvedHost },
				hint: "Set indexName in the search config.",
			});
		}

		const url = `${resolvedHost}/indexes/${encodeURIComponent(indexName)}/documents`;
		const headers: Record<string, string> = {};

		if (apiKey) {
			headers.Authorization = `Bearer ${apiKey}`;
		}

		try {
			const response = await fetch(url, {
				method: "DELETE",
				headers,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			throw pluginError("MeiliSearch clear failed", {
				context: { config, host: resolvedHost, error: String(error) },
			});
		}
	},
});
