/**
 * Live Editor Ports
 *
 * Module-specific interfaces for live editor
 */

import type {
	CommitOptions,
	FileContent,
	GitStatus,
	PushOptions,
} from "../types";

/**
 * Git adapter interface
 */
export interface GitAdapter {
	/** Get current branch */
	getCurrentBranch(): Promise<string>;
	/** Get git status */
	getStatus(): Promise<GitStatus>;
	/** Commit changes */
	commit(options: CommitOptions): Promise<void>;
	/** Push changes */
	push(options?: PushOptions): Promise<void>;
	/** Stage file */
	stageFile(path: string): Promise<void>;
	/** Unstage file */
	unstageFile(path: string): Promise<void>;
	/** Discard changes */
	discardChanges(path: string): Promise<void>;
}

/**
 * File system adapter interface
 */
export interface FileSystemAdapter {
	/** Read file */
	readFile(path: string): Promise<string>;
	/** Write file */
	writeFile(path: string, content: string): Promise<void>;
	/** Watch file */
	watchFile(path: string, callback: (content: string) => void): () => void;
	/** Get file stats */
	getFileStats(path: string): Promise<{ mtimeMs: number; size: number }>;
}

// Re-export types for convenience
export type { CommitOptions, FileContent, GitStatus, PushOptions };
