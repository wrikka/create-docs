/**
 * Content Validation Ports
 *
 * Module-specific interfaces for content validation
 */

import type { ValidationOptions, ValidationResult } from "../types";

/**
 * Content validator interface
 */
export interface ContentValidator {
	/** Validate content */
	validate(content: string, options?: ValidationOptions): ValidationResult;
}
