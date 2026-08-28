// Git History Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { type } from "arktype";

/**
 * Commit Hash Schema
 */
export const commitHashSchema = type(/^[a-f0-9]{40}$/);

export type CommitHash = typeof commitHashSchema.infer;

/**
 * Branch Name Schema
 */
export const branchNameSchema = type("string >= 1");

export type BranchName = typeof branchNameSchema.infer;

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
 * Validate commit hash using Arktype
 */
export const validateCommitHash = (hash: unknown): CommitHash => {
	const result = commitHashSchema(hash);
	if (result instanceof type.errors) {
		throw new ValidationError(
			"Commit hash must be a valid 40-character hex string",
		);
	}
	return result as CommitHash;
};

/**
 * Validate branch name using Arktype
 */
export const validateBranchName = (name: unknown): BranchName => {
	const result = branchNameSchema(name);
	if (result instanceof type.errors) {
		throw new ValidationError("Branch name must be a non-empty string");
	}
	return result as BranchName;
};
