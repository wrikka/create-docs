/**
 * Pure git history operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { GitCommit } from "../../types/git-history";

export type GitHistoryError = {
	readonly kind: "git-history-error";
	readonly message: string;
};

/**
 * Filter commits by date range.
 */
export const filterCommitsByDate = (
	commits: readonly GitCommit[],
	since: string,
	until: string,
): Result<readonly GitCommit[], GitHistoryError> => {
	try {
		const sinceDate = new Date(since);
		const untilDate = new Date(until);

		const filtered = commits.filter((commit) => {
			const commitDate = new Date(commit.date);
			return commitDate >= sinceDate && commitDate <= untilDate;
		});

		return ok(filtered);
	} catch (error) {
		return err({
			kind: "git-history-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Limit commits to max count.
 */
export const limitCommits = (
	commits: readonly GitCommit[],
	max: number,
): readonly GitCommit[] => {
	return commits.slice(0, max);
};

/**
 * Format commit for display.
 */
export const formatCommit = (commit: GitCommit): string => {
	return `${commit.hash.slice(0, 7)} - ${commit.message} (${commit.author})`;
};
