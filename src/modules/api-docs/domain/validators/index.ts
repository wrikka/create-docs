// API Docs Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * API Path Schema
 */
export const apiPathSchema = type("string >= 1").narrow((path: string) =>
	path.startsWith("/"),
);

export type ApiPath = typeof apiPathSchema.infer;

/**
 * HTTP Method Schema
 */
export const httpMethodSchema = type(
	"'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'",
);

export type HttpMethod = typeof httpMethodSchema.infer;

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
 * Validate API path using Arktype
 */
export const validateApiPath = (path: unknown): ApiPath => {
	const result = apiPathSchema(path);
	if (result instanceof type.errors) {
		throw new ValidationError(
			"API path must be a non-empty string starting with /",
		);
	}
	return result as ApiPath;
};

/**
 * Validate HTTP method using Arktype
 */
export const validateHttpMethod = (method: unknown): HttpMethod => {
	const result = httpMethodSchema(method);
	if (result instanceof type.errors) {
		throw new ValidationError("Invalid HTTP method");
	}
	return result as HttpMethod;
};
