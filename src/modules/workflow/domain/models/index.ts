/**
 * Domain models for workflow
 */
export interface WorkflowStep {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly status: "pending" | "in-progress" | "completed" | "failed";
}

export interface Workflow {
	readonly id: string;
	readonly name: string;
	readonly steps: readonly WorkflowStep[];
	readonly currentStepIndex: number;
}

export const createWorkflowStep = (
	id: string,
	name: string,
	description: string,
	status: WorkflowStep["status"] = "pending",
): WorkflowStep => ({
	id,
	name,
	description,
	status,
});

export const createWorkflow = (
	id: string,
	name: string,
	steps: readonly WorkflowStep[],
	currentStepIndex: number = 0,
): Workflow => ({
	id,
	name,
	steps,
	currentStepIndex,
});
