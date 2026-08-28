/**
 * Port for code execution operations.
 */

export type ExecutionPort = {
	/**
	 * Execute code in sandbox.
	 */
	readonly execute: (code: string, config: unknown) => Promise<unknown>;

	/**
	 * Validate code for safety.
	 */
	readonly validate: (code: string) => Promise<boolean>;
};
