// I18n Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Locale Code Schema
 */
export const localeCodeSchema: Type = type("string").narrow(
	(code: string) => code.length === 2,
);

export type LocaleCode = typeof localeCodeSchema.infer;

/**
 * Translation Key Schema
 */
export const translationKeySchema: Type = type("string >= 1");

export type TranslationKey = typeof translationKeySchema.infer;

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
 * Validate locale code using Arktype
 */
export const validateLocaleCode = (code: unknown): LocaleCode => {
	const result = localeCodeSchema(code);
	if (result instanceof type.errors) {
		throw new ValidationError("Locale code must be a 2-character string");
	}
	return result as LocaleCode;
};

/**
 * Validate translation key using Arktype
 */
export const validateTranslationKey = (key: unknown): TranslationKey => {
	const result = translationKeySchema(key);
	if (result instanceof type.errors) {
		throw new ValidationError("Translation key must be a non-empty string");
	}
	return result as TranslationKey;
};
