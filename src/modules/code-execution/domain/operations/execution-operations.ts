/**
 * Pure code execution operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type {
	CodeExecutionConfig,
	ExecutionResult,
} from "../../types/execution";

export type ExecutionError = {
	readonly kind: "execution-error";
	readonly message: string;
};

/**
 * Execute code in sandbox.
 */
export const executeCode = (
	_code: string,
	_config: CodeExecutionConfig,
): Result<ExecutionResult, ExecutionError> => {
	try {
		// This will be implemented via adapter
		// For now, return a basic result
		return ok({
			output: "",
			error: null,
			exitCode: 0,
		});
	} catch (error) {
		return err({
			kind: "execution-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Validate code before execution.
 */
export const validateCode = (code: string): boolean => {
	// Basic validation - check for dangerous operations
	const dangerousPatterns = [
		/require\s*\(\s*['"]child_process['"]\s*\)/,
		/require\s*\(\s*['"]fs['"]\s*\)/,
		/eval\s*\(/,
		/Function\s*\(/,
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(code)) {
			return false;
		}
	}

	return true;
};
