/**
 * Sandbox adapter implementation.
 * Provides isolated code execution environment.
 */

import type { ExecutionPort } from "../ports/execution-port";
import type { ExecutionResult } from "../types/execution";

export const createSandboxAdapter = (): ExecutionPort => ({
	execute: async (code: string, _config?: unknown) => {
		try {
			console.log(
				"Sandbox execution not yet implemented - requires sandbox dependency",
			);
			console.log(`Code length: ${code.length} characters`);
			return {
				success: false,
				output: "",
				error: "Sandbox not implemented",
				exitCode: 1,
			} as ExecutionResult;
		} catch (error) {
			return {
				success: false,
				output: "",
				error: error instanceof Error ? error.message : "Unknown error",
				exitCode: 1,
			} as ExecutionResult;
		}
	},

	validate: async (_code: string) => {
		try {
			console.log("Code validation not yet implemented");
			return true;
		} catch (error) {
			console.error("Failed to validate code:", error);
			return false;
		}
	},
});
