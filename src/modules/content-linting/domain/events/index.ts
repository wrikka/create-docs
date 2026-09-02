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
	now: number = Date.now(),
): LintingStartedEvent => ({
	type: "LINTING_STARTED",
	timestamp: now,
	filePath,
});

export const createLintingCompletedEvent = (
	filePath: string,
	issueCount: number,
	now: number = Date.now(),
): LintingCompletedEvent => ({
	type: "LINTING_COMPLETED",
	timestamp: now,
	filePath,
	issueCount,
});

export const createIssueFoundEvent = (
	ruleId: string,
	message: string,
	now: number = Date.now(),
): IssueFoundEvent => ({
	type: "ISSUE_FOUND",
	timestamp: now,
	ruleId,
	message,
});
