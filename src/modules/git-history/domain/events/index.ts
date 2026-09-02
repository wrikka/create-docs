/**
 * Domain events for git history
 */
export interface HistoryLoadedEvent {
	readonly type: "HISTORY_LOADED";
	readonly timestamp: number;
	readonly commitCount: number;
}

export interface CommitSelectedEvent {
	readonly type: "COMMIT_SELECTED";
	readonly timestamp: number;
	readonly commitHash: string;
}

export type GitHistoryDomainEvent = HistoryLoadedEvent | CommitSelectedEvent;

export const createHistoryLoadedEvent = (
	commitCount: number,
	now: number = Date.now(),
): HistoryLoadedEvent => ({
	type: "HISTORY_LOADED",
	timestamp: now,
	commitCount,
});

export const createCommitSelectedEvent = (
	commitHash: string,
	now: number = Date.now(),
): CommitSelectedEvent => ({
	type: "COMMIT_SELECTED",
	timestamp: now,
	commitHash,
});
