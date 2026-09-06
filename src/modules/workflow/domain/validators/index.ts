// Workflow Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type Type, type } from "arktype";

/**
 * Step Name Schema
 */
export const stepNameSchema: Type = type("string >= 1");

export type StepName = typeof stepNameSchema.infer;

/**
 * Workflow Name Schema
 */
export const workflowNameSchema: Type = type("string >= 1");

export type WorkflowName = typeof workflowNameSchema.infer;

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
 * Validate step name using Arktype
 */
export const validateStepName = (name: unknown): StepName => {
	const result = stepNameSchema(name);
	if (result instanceof type.errors) {
		throw new ValidationError("Step name must be a non-empty string");
	}
	return result as StepName;
};

/**
 * Validate workflow name using Arktype
 */
export const validateWorkflowName = (name: unknown): WorkflowName => {
	const result = workflowNameSchema(name);
	if (result instanceof type.errors) {
		throw new ValidationError("Workflow name must be a non-empty string");
	}
	return result as WorkflowName;
};
