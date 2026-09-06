// Live Editor Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Content Schema
 */
export const contentSchema: Type = type("string");

export type Content = typeof contentSchema.infer;

/**
 * Cursor Position Schema
 */
export const cursorPositionSchema: Type = type({
	line: "number >= 0",
	column: "number >= 0",
});

export type CursorPosition = typeof cursorPositionSchema.infer;

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
 * Validate content using Arktype
 */
export const validateContent = (content: unknown): Content => {
	const result = contentSchema(content);
	if (result instanceof type.errors) {
		throw new ValidationError("Content must be a string");
	}
	return result as Content;
};

/**
 * Validate cursor position using Arktype
 */
export const validateCursorPosition = (position: unknown): CursorPosition => {
	const result = cursorPositionSchema(position);
	if (result instanceof type.errors) {
		throw new ValidationError(
			"Cursor position must be a valid object with line and column",
		);
	}
	return result as CursorPosition;
};
