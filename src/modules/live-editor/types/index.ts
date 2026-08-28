/**
 * Live Editor Types
 *
 * Domain types for live editor with Git integration
 */

/**
 * Editor mode
 */
export type EditorMode = "preview" | "edit" | "split";

/**
 * File content
 */
export interface FileContent {
	/** File path */
	path: string;
	/** File content */
	content: string;
	/** Language (for syntax highlighting) */
	language?: string;
	/** Last modified timestamp */
	mtimeMs?: number;
}

/**
 * Git status
 */
export interface GitStatus {
	/** Current branch */
	branch: string;
	/** Has uncommitted changes */
	hasChanges: boolean;
	/** Untracked files */
	untracked: string[];
	/** Modified files */
	modified: string[];
	/** Staged files */
	staged: string[];
}

/**
 * Commit options
 */
export interface CommitOptions {
	/** Commit message */
	message: string;
	/** Author name */
	author?: string;
	/** Author email */
	email?: string;
}

/**
 * Push options
 */
export interface PushOptions {
	/** Remote name (default: origin) */
	remote?: string;
	/** Branch name (default: current branch) */
	branch?: string;
	/** Force push */
	force?: boolean;
}

/**
 * Editor state
 */
export interface EditorState {
	/** Current mode */
	mode: EditorMode;
	/** Current file */
	currentFile: FileContent | null;
	/** Git status */
	gitStatus: GitStatus | null;
	/** Is loading */
	loading: boolean;
	/** Error message */
	error?: string;
}
