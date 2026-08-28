// Content Linting Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Rule Name Schema
 */
export const ruleNameSchema = type("string >= 1");

export type RuleName = typeof ruleNameSchema.infer;

/**
 * Severity Schema
 */
export const severitySchema = type("'error' | 'warning' | 'info'");

export type Severity = typeof severitySchema.infer;

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
 * Validate rule name using Arktype
 */
export const validateRuleName = (name: unknown): RuleName => {
	const result = ruleNameSchema(name);
	if (result instanceof type.errors) {
		throw new ValidationError("Rule name must be a non-empty string");
	}
	return result as RuleName;
};

/**
 * Validate severity using Arktype
 */
export const validateSeverity = (severity: unknown): Severity => {
	const result = severitySchema(severity);
	if (result instanceof type.errors) {
		throw new ValidationError("Invalid severity level");
	}
	return result as Severity;
};
