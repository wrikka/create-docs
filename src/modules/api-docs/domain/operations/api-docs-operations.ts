/**
 * Pure API docs operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { ApiDocsConfig, ApiEndpoint } from "../../types/api-docs";

export type ApiDocsError = {
	readonly kind: "api-docs-error";
	readonly message: string;
};

/**
 * Group endpoints by path prefix.
 */
export const groupEndpointsByPath = (
	endpoints: readonly ApiEndpoint[],
): Result<Record<string, readonly ApiEndpoint[]>, ApiDocsError> => {
	try {
		const groups: Record<string, ApiEndpoint[]> = {};

		for (const endpoint of endpoints) {
			const prefix = endpoint.path.split("/")[1] || "root";
			if (!groups[prefix]) {
				groups[prefix] = [];
			}
			groups[prefix].push(endpoint);
		}

		return ok(groups);
	} catch (error) {
		return err({
			kind: "api-docs-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Generate markdown from endpoint.
 */
export const generateEndpointMarkdown = (endpoint: ApiEndpoint): string => {
	return `## ${endpoint.method.toUpperCase()} ${endpoint.path}

${endpoint.description}
`;
};

/**
 * Validate API docs config.
 */
export const validateApiDocsConfig = (config: ApiDocsConfig): boolean => {
	if (!config.source) return false;
	if (!config.sourcePath) return false;
	if (!config.outputPath) return false;
	return true;
};
