/**
 * Domain models for git history
 */
export interface GitCommit {
	readonly hash: string;
	readonly message: string;
	readonly author: string;
	readonly timestamp: number;
	readonly branch: string;
}

export const createGitCommit = (
	hash: string,
	message: string,
	author: string,
	branch: string,
	options?: { timestamp?: number },
	now: number = Date.now(),
): GitCommit => ({
	hash,
	message,
	author,
	branch,
	timestamp: options?.timestamp ?? now,
});
