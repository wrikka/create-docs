// Code Block Enhancements Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Language Schema
 */
export const languageSchema = type("string >= 1");

export type Language = typeof languageSchema.infer;

/**
 * Code Schema
 */
export const codeSchema = type("string");

export type Code = typeof codeSchema.infer;

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
 * Validate language using Arktype
 */
export const validateLanguage = (language: unknown): Language => {
	const result = languageSchema(language);
	if (result instanceof type.errors) {
		throw new ValidationError("Language must be a non-empty string");
	}
	return result as Language;
};

/**
 * Validate code using Arktype
 */
export const validateCode = (code: unknown): Code => {
	const result = codeSchema(code);
	if (result instanceof type.errors) {
		throw new ValidationError("Code must be a string");
	}
	return result as Code;
};
