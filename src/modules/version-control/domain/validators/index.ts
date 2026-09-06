// Version Control Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Version Number Schema
 */
export const versionNumberSchema: Type = type(/^\d+\.\d+\.\d+$/);

export type VersionNumber = typeof versionNumberSchema.infer;

/**
 * Author Schema
 */
export const authorSchema: Type = type("string >= 1");

export type Author = typeof authorSchema.infer;

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
 * Validate version number using Arktype
 */
export const validateVersionNumber = (number: unknown): VersionNumber => {
	const result = versionNumberSchema(number);
	if (result instanceof type.errors) {
		throw new ValidationError("Version number must be in format x.y.z");
	}
	return result as VersionNumber;
};

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
