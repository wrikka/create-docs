/**
 * Git history types for version tracking.
 */

export type GitCommit = {
	readonly hash: string;
	readonly author: string;
	readonly date: string;
	readonly message: string;
};

export type GitHistoryConfig = {
	readonly enabled: boolean;
	readonly maxCommits: number;
};
