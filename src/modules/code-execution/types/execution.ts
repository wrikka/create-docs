/**
 * Code execution types for interactive code blocks.
 */

export type CodeExecutionConfig = {
	readonly enabled: boolean;
	readonly timeout: number;
	readonly sandbox: boolean;
};

export type ExecutionResult = {
	readonly output: string;
	readonly error: string | null;
	readonly exitCode: number;
};
