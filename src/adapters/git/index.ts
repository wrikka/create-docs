/**
 * Git Adapter
 *
 * Adapter layer for Git operations using simple-git
 */

import simpleGit, { type SimpleGit } from "simple-git";
import type {
	CommitOptions,
	GitAdapter,
	GitStatus,
	PushOptions,
} from "../../modules/live-editor/ports";

interface GitFile {
	path: string;
	index: string;
	working_dir: string;
}

// Git adapter state
export interface SimpleGitAdapterState {
	readonly git: SimpleGit;
}

export const createSimpleGitAdapterState = (
	cwd: string = process.cwd(),
): SimpleGitAdapterState => ({
	git: simpleGit(cwd),
});

// Pure functions for git operations
export const gitGetCurrentBranch = async (
	state: SimpleGitAdapterState,
): Promise<string> => {
	const branch = await state.git.branch();
	return branch.current;
};

export const gitGetStatus = async (
	state: SimpleGitAdapterState,
): Promise<GitStatus> => {
	const status = await state.git.status();
	const branch = await gitGetCurrentBranch(state);

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

export const gitCommit = async (
	state: SimpleGitAdapterState,
	options: CommitOptions,
): Promise<void> => {
	await state.git.add(".");
	if (options.author && options.email) {
		await state.git.commit([
			options.message,
			"--author",
			`${options.author} <${options.email}>`,
		]);
	} else {
		await state.git.commit(options.message);
	}
};

export const gitPush = async (
	state: SimpleGitAdapterState,
	options: PushOptions = {},
): Promise<void> => {
	const remote = options.remote || "origin";
	const branch = options.branch || (await gitGetCurrentBranch(state));

	if (options.force) {
		await state.git.push(["--force", remote, branch]);
	} else {
		await state.git.push(remote, branch);
	}
};

export const gitStageFile = async (
	state: SimpleGitAdapterState,
	path: string,
): Promise<void> => {
	await state.git.add(path);
};

export const gitUnstageFile = async (
	state: SimpleGitAdapterState,
	path: string,
): Promise<void> => {
	await state.git.reset(["--mixed", path]);
};

export const gitDiscardChanges = async (
	state: SimpleGitAdapterState,
	path: string,
): Promise<void> => {
	await state.git.checkout(path, { "--": path });
};

/**
 * SimpleGit adapter implementation
 */
export class SimpleGitAdapter implements GitAdapter {
	private state: SimpleGitAdapterState;

	constructor(cwd: string = process.cwd()) {
		this.state = createSimpleGitAdapterState(cwd);
	}

	getState(): SimpleGitAdapterState {
		return this.state;
	}

	setState(state: SimpleGitAdapterState): void {
		this.state = state;
	}

	async getCurrentBranch(): Promise<string> {
		return gitGetCurrentBranch(this.state);
	}

	async getStatus(): Promise<GitStatus> {
		return gitGetStatus(this.state);
	}

	async commit(options: CommitOptions): Promise<void> {
		return gitCommit(this.state, options);
	}

	async push(options: PushOptions = {}): Promise<void> {
		return gitPush(this.state, options);
	}

	async stageFile(path: string): Promise<void> {
		return gitStageFile(this.state, path);
	}

	async unstageFile(path: string): Promise<void> {
		return gitUnstageFile(this.state, path);
	}

	async discardChanges(path: string): Promise<void> {
		return gitDiscardChanges(this.state, path);
	}
}

/**
 * Create Git adapter
 */
export const createGitAdapter = (cwd?: string): GitAdapter => {
	return new SimpleGitAdapter(cwd);
};
