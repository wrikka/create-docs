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
): HistoryLoadedEvent => ({
	type: "HISTORY_LOADED",
	timestamp: Date.now(),
	commitCount,
});

export const createCommitSelectedEvent = (
	commitHash: string,
): CommitSelectedEvent => ({
	type: "COMMIT_SELECTED",
	timestamp: Date.now(),
	commitHash,
});
