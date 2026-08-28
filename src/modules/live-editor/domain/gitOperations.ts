/**
 * Git Operations
 *
 * Pure functions for Git operations using simple-git
 */

import type { SimpleGit } from "simple-git";
import type { CommitOptions, GitStatus, PushOptions } from "../types";

interface GitFile {
	path: string;
	index: string;
	working_dir: string;
}

/**
 * Get current branch name
 */
export const getCurrentBranch = async (git: SimpleGit): Promise<string> => {
	const branch = await git.branch();
	return branch.current;
};

/**
 * Get git status
 */
export const getGitStatus = async (git: SimpleGit): Promise<GitStatus> => {
	const status = await git.status();
	const branch = await getCurrentBranch(git);

	return {
		branch,
		hasChanges: status.files.length > 0,
		untracked: status.files
			.filter((f: GitFile) => f.working_dir === "?")
			.map((f: GitFile) => f.path),
		modified: status.files
			.filter((f: GitFile) => f.working_dir === "M")
			.map((f: GitFile) => f.path),
		staged: status.files
			.filter((f: GitFile) => f.index === "M")
			.map((f: GitFile) => f.path),
	};
};

/**
 * Commit changes
 */
export const commitChanges = async (
	git: SimpleGit,
	options: CommitOptions,
): Promise<void> => {
	await git.add(".");
	if (options.author && options.email) {
		await git.commit([
			options.message,
			"--author",
			`${options.author} <${options.email}>`,
		]);
	} else {
		await git.commit(options.message);
	}
};

/**
 * Push changes
 */
export const pushChanges = async (
	git: SimpleGit,
	options: PushOptions = {},
): Promise<void> => {
	const remote = options.remote || "origin";
	const branch = options.branch || (await getCurrentBranch(git));

	if (options.force) {
		await git.push(["--force", remote, branch]);
	} else {
		await git.push(remote, branch);
	}
};

/**
 * Stage file
 */
export const stageFile = async (
	git: SimpleGit,
	path: string,
): Promise<void> => {
	await git.add(path);
};

/**
 * Unstage file
 */
export const unstageFile = async (
	git: SimpleGit,
	path: string,
): Promise<void> => {
	await git.reset(["--mixed", path]);
};

/**
 * Discard changes
 */
export const discardChanges = async (
	git: SimpleGit,
	path: string,
): Promise<void> => {
	await git.checkout(["--", path]);
};
