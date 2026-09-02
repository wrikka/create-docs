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
	now: number = Date.now(),
): ExecutionStartedEvent => ({
	type: "EXECUTION_STARTED",
	timestamp: now,
	executionId,
});

export const createExecutionCompletedEvent = (
	executionId: string,
	output: string,
	now: number = Date.now(),
): ExecutionCompletedEvent => ({
	type: "EXECUTION_COMPLETED",
	timestamp: now,
	executionId,
	output,
});

export const createExecutionFailedEvent = (
	executionId: string,
	error: string,
	now: number = Date.now(),
): ExecutionFailedEvent => ({
	type: "EXECUTION_FAILED",
	timestamp: now,
	executionId,
	error,
});
