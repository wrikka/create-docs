/**
 * Domain events for code execution
 */
export interface ExecutionStartedEvent {
	readonly type: "EXECUTION_STARTED";
	readonly timestamp: number;
	readonly executionId: string;
}

export interface ExecutionCompletedEvent {
	readonly type: "EXECUTION_COMPLETED";
	readonly timestamp: number;
	readonly executionId: string;
	readonly output: string;
}

export interface ExecutionFailedEvent {
	readonly type: "EXECUTION_FAILED";
	readonly timestamp: number;
	readonly executionId: string;
	readonly error: string;
}

export type CodeExecutionDomainEvent =
	| ExecutionStartedEvent
	| ExecutionCompletedEvent
	| ExecutionFailedEvent;

export const createExecutionStartedEvent = (
	executionId: string,
): ExecutionStartedEvent => ({
	type: "EXECUTION_STARTED",
	timestamp: Date.now(),
	executionId,
});

export const createExecutionCompletedEvent = (
	executionId: string,
	output: string,
): ExecutionCompletedEvent => ({
	type: "EXECUTION_COMPLETED",
	timestamp: Date.now(),
	executionId,
	output,
});

export const createExecutionFailedEvent = (
	executionId: string,
	error: string,
): ExecutionFailedEvent => ({
	type: "EXECUTION_FAILED",
	timestamp: Date.now(),
	executionId,
	error,
});
