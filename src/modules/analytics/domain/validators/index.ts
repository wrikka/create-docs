// Analytics Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Path Schema
 */
export const pathSchema: Type = type("string >= 1");

export type Path = typeof pathSchema.infer;

/**
 * Search Query Schema
 */
export const searchQuerySchema: Type = type("string >= 1");

export type SearchQuery = typeof searchQuerySchema.infer;

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
 * Validate path using Arktype
 */
export const validatePath = (path: unknown): Path => {
	const result = pathSchema(path);
	if (result instanceof type.errors) {
		throw new ValidationError("Path must be a non-empty string");
	}
	return result as Path;
};

/**
 * Validate search query using Arktype
 */
export const validateSearchQuery = (query: unknown): SearchQuery => {
	const result = searchQuerySchema(query);
	if (result instanceof type.errors) {
		throw new ValidationError("Search query must be a non-empty string");
	}
	return result as SearchQuery;
};
