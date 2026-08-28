/**
 * Domain models for code execution
 */
export interface CodeExecution {
	readonly id: string;
	readonly language: string;
	readonly code: string;
	readonly output?: string;
	readonly error?: string;
	readonly status: "pending" | "running" | "completed" | "failed";
	readonly timestamp: number;
}

export const createCodeExecution = (
	id: string,
	language: string,
	code: string,
	options?: {
		output?: string;
		error?: string;
		status?: CodeExecution["status"];
		timestamp?: number;
	},
): CodeExecution => ({
	id,
	language,
	code,
	output: options?.output,
	error: options?.error,
	status: options?.status ?? "pending",
	timestamp: options?.timestamp ?? Date.now(),
});
