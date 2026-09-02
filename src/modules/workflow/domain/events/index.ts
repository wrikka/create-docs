/**
 * Domain events for workflow
 */
export interface WorkflowStartedEvent {
	readonly type: "WORKFLOW_STARTED";
	readonly timestamp: number;
	readonly workflowId: string;
}

export interface WorkflowCompletedEvent {
	readonly type: "WORKFLOW_COMPLETED";
	readonly timestamp: number;
	readonly workflowId: string;
}

export interface StepCompletedEvent {
	readonly type: "STEP_COMPLETED";
	readonly timestamp: number;
	readonly workflowId: string;
	readonly stepId: string;
}

export type WorkflowDomainEvent =
	| WorkflowStartedEvent
	| WorkflowCompletedEvent
	| StepCompletedEvent;

export const createWorkflowStartedEvent = (
	workflowId: string,
	now: number = Date.now(),
): WorkflowStartedEvent => ({
	type: "WORKFLOW_STARTED",
	timestamp: now,
	workflowId,
});

export const createWorkflowCompletedEvent = (
	workflowId: string,
	now: number = Date.now(),
): WorkflowCompletedEvent => ({
	type: "WORKFLOW_COMPLETED",
	timestamp: now,
	workflowId,
});

export const createStepCompletedEvent = (
	workflowId: string,
	stepId: string,
	now: number = Date.now(),
): StepCompletedEvent => ({
	type: "STEP_COMPLETED",
	timestamp: now,
	workflowId,
	stepId,
});
