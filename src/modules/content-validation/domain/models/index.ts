/**
 * Content Validation Domain Models
 *
 * Readonly data models for content validation
 */

/**
 * Validation error model
 */
export interface ValidationError {
	readonly message: string;
	readonly line?: number;
	readonly column?: number;
	readonly severity: "error" | "warning" | "info";
}

/**
 * Validation result model
 */
export interface ValidationResult {
	readonly valid: boolean;
	readonly errors: readonly ValidationError[];
}

/**
 * Validation options model
 */
export interface ValidationOptions {
	readonly checkHeadings?: boolean;
	readonly checkLinks?: boolean;
	readonly checkImages?: boolean;
	readonly checkCodeBlocks?: boolean;
}
