/**
 * Content Validation Use Cases
 *
 * Orchestration layer for content validation
 */

import { validateContent } from "../../domain";
import type { ValidationOptions, ValidationResult } from "../../types";

/**
 * Validate content
 */
export const validate = (
	content: string,
	options: ValidationOptions = {},
): ValidationResult => {
	return validateContent(content, options);
};
