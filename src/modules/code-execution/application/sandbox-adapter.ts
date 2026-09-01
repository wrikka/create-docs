/**
 * Sandbox adapter implementation.
 * Provides a safe placeholder for isolated code execution.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { ExecutionPort } from "../ports/execution-port";
import type { CodeExecutionConfig } from "../types/execution";

const SANDBOX_MISSING_ERROR =
	"Sandbox dependency is not installed. Isolated code execution requires a sandbox package such as vm2 or isolated-vm.";

export const createSandboxAdapter = (): ExecutionPort => ({
	execute: async (code: string, _config?: unknown) => {
		const cfg = _config as Partial<CodeExecutionConfig> | undefined;

		if (cfg?.enabled === false) {
			throw configError("Code execution is disabled", {
				context: { enabled: false },
			});
		}

		if (!cfg?.sandbox) {
			throw configError("Code execution config requires sandbox: true", {
				context: { config: cfg },
				hint: "Enable sandbox in the execution config, or install a sandbox package.",
			});
		}

		throw pluginError(SANDBOX_MISSING_ERROR, {
			context: { codeLength: code.length },
			hint: "Install an isolated execution sandbox and configure it before running code.",
		});
	},

	validate: async (_code: string) => {
		throw pluginError(
			"Code validation cannot be performed safely without an isolated sandbox environment.",
			{
				hint: "Install a sandbox package and configure it before validating code.",
			},
		);
	},
});
