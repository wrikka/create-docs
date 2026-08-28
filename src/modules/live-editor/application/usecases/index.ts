/**
 * Live Editor Use Cases
 *
 * Orchestration layer for live editor operations
 */

import type { CommitOptions, GitAdapter, PushOptions } from "../../ports";
import type { EditorState } from "../../types";

/**
 * Load editor state
 */
export const loadEditorState = async (
	git: GitAdapter,
	_filePath: string,
): Promise<EditorState> => {
	try {
		const gitStatus = await git.getStatus();

		return {
			mode: "split",
			currentFile: null, // Will be loaded separately
			gitStatus,
			loading: false,
		};
	} catch (error) {
		return {
			mode: "split",
			currentFile: null,
			gitStatus: null,
			loading: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

/**
 * Commit and push changes
 */
export const commitAndPush = async (
	git: GitAdapter,
	options: CommitOptions & { push?: boolean; pushOptions?: PushOptions },
): Promise<void> => {
	await git.commit(options);

	if (options.push) {
		await git.push(options.pushOptions);
	}
};

/**
 * Save file
 */
export const saveFile = async (
	fileSystem: { writeFile: (path: string, content: string) => Promise<void> },
	filePath: string,
	content: string,
): Promise<void> => {
	await fileSystem.writeFile(filePath, content);
};
