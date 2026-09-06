// Export Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Export Format Schema
 */
export const exportFormatSchema: Type = type(
	"'pdf' | 'html' | 'markdown' | 'json'",
);

export type ExportFormat = typeof exportFormatSchema.infer;

/**
 * Filename Schema
 */
export const filenameSchema: Type = type("string >= 1");

export type Filename = typeof filenameSchema.infer;

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
 * Validate export format using Arktype
 */
export const validateExportFormat = (format: unknown): ExportFormat => {
	const result = exportFormatSchema(format);
	if (result instanceof type.errors) {
		throw new ValidationError("Invalid export format");
	}
	return result as ExportFormat;
};

/**
 * Validate filename using Arktype
 */
export const validateFilename = (filename: unknown): Filename => {
	const result = filenameSchema(filename);
	if (result instanceof type.errors) {
		throw new ValidationError("Filename must be a non-empty string");
	}
	return result as Filename;
};
