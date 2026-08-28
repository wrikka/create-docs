// External Search Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Search Endpoint Schema
 */
export const searchEndpointSchema = type("string >= 1").narrow(
	(endpoint: string) =>
		endpoint.startsWith("http://") || endpoint.startsWith("https://"),
);

export type SearchEndpoint = typeof searchEndpointSchema.infer;

/**
 * Search URL Schema
 */
export const searchUrlSchema = type("string >= 1").narrow(
	(url: string) => url.startsWith("http://") || url.startsWith("https://"),
);

export type SearchUrl = typeof searchUrlSchema.infer;

/**
 * Validation errors
 */
export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}

/**
 * Validate search endpoint using Arktype
 */
export const validateSearchEndpoint = (endpoint: unknown): SearchEndpoint => {
	const result = searchEndpointSchema(endpoint);
	if (result instanceof type.errors) {
		throw new ValidationError("Search endpoint must be a valid URL");
	}
	return result as SearchEndpoint;
};

/**
 * Validate search URL using Arktype
 */
export const validateSearchUrl = (url: unknown): SearchUrl => {
	const result = searchUrlSchema(url);
	if (result instanceof type.errors) {
		throw new ValidationError("Search URL must be a valid URL");
	}
	return result as SearchUrl;
};
