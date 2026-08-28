/**
 * Pure OpenAPI parser operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { OpenApiEndpoint } from "../../types/openapi";

export type OpenApiParseError = {
	readonly kind: "openapi-parse-error";
	readonly message: string;
};

/**
 * Parse OpenAPI 3 schema to typed endpoints.
 */
export const parseOpenApiSchema = (
	_schema: unknown,
): Result<readonly OpenApiEndpoint[], OpenApiParseError> => {
	try {
		// This will be implemented via adapter (swagger-parser)
		// For now, return empty array
		return ok([]);
	} catch (error) {
		return err({
			kind: "openapi-parse-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Convert OpenAPI endpoint to internal ApiEndpoint format.
 */
export const openApiToApiEndpoint = (endpoint: OpenApiEndpoint): unknown => {
	return {
		method: endpoint.method,
		path: endpoint.path,
		summary: endpoint.summary,
		description: endpoint.description,
		parameters: endpoint.parameters,
		requestBody: endpoint.requestBody,
		responses: endpoint.responses,
	};
};
