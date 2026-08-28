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
): WorkflowStartedEvent => ({
	type: "WORKFLOW_STARTED",
	timestamp: Date.now(),
	workflowId,
});

export const createWorkflowCompletedEvent = (
	workflowId: string,
): WorkflowCompletedEvent => ({
	type: "WORKFLOW_COMPLETED",
	timestamp: Date.now(),
	workflowId,
});

export const createStepCompletedEvent = (
	workflowId: string,
	stepId: string,
): StepCompletedEvent => ({
	type: "STEP_COMPLETED",
	timestamp: Date.now(),
	workflowId,
	stepId,
});
