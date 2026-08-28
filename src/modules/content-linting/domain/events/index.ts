/**
 * Domain events for content linting
 */
export interface LintingStartedEvent {
	readonly type: "LINTING_STARTED";
	readonly timestamp: number;
	readonly filePath: string;
}

export interface LintingCompletedEvent {
	readonly type: "LINTING_COMPLETED";
	readonly timestamp: number;
	readonly filePath: string;
	readonly issueCount: number;
}

export interface IssueFoundEvent {
	readonly type: "ISSUE_FOUND";
	readonly timestamp: number;
	readonly ruleId: string;
	readonly message: string;
}

export type ContentLintingDomainEvent =
	| LintingStartedEvent
	| LintingCompletedEvent
	| IssueFoundEvent;

export const createLintingStartedEvent = (
	filePath: string,
): LintingStartedEvent => ({
	type: "LINTING_STARTED",
	timestamp: Date.now(),
	filePath,
});

export const createLintingCompletedEvent = (
	filePath: string,
	issueCount: number,
): LintingCompletedEvent => ({
	type: "LINTING_COMPLETED",
	timestamp: Date.now(),
	filePath,
	issueCount,
});

export const createIssueFoundEvent = (
	ruleId: string,
	message: string,
): IssueFoundEvent => ({
	type: "ISSUE_FOUND",
	timestamp: Date.now(),
	ruleId,
	message,
});
