// Comments Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Author Schema
 */
export const authorSchema = type("string >= 1");

export type Author = typeof authorSchema.infer;

/**
 * Content Schema
 */
export const contentSchema = type("string >= 1");

export type Content = typeof contentSchema.infer;

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
 * Validate author using Arktype
 */
export const validateAuthor = (author: unknown): Author => {
	const result = authorSchema(author);
	if (result instanceof type.errors) {
		throw new ValidationError("Author must be a non-empty string");
	}
	return result as Author;
};

/**
 * Validate content using Arktype
 */
export const validateContent = (content: unknown): Content => {
	const result = contentSchema(content);
	if (result instanceof type.errors) {
		throw new ValidationError("Content must be a non-empty string");
	}
	return result as Content;
};
