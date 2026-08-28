// Image Optimization Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Image Path Schema
 */
export const imagePathSchema = type("string >= 1");

export type ImagePath = typeof imagePathSchema.infer;

/**
 * Quality Schema
 */
export const qualitySchema = type("number >= 0").narrow(
	(quality: number) => quality <= 100,
);

export type Quality = typeof qualitySchema.infer;

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
 * Validate image path using Arktype
 */
export const validateImagePath = (path: unknown): ImagePath => {
	const result = imagePathSchema(path);
	if (result instanceof type.errors) {
		throw new ValidationError("Image path must be a non-empty string");
	}
	return result as ImagePath;
};

/**
 * Validate quality using Arktype
 */
export const validateQuality = (quality: unknown): Quality => {
	const result = qualitySchema(quality);
	if (result instanceof type.errors) {
		throw new ValidationError("Quality must be a number between 0 and 100");
	}
	return result as Quality;
};
