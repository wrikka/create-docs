/**
 * Port for git history operations.
 */

export type GitHistoryPort = {
	/**
	 * Get git log for a file.
	 */
	readonly getLog: (
		filePath: string,
		config: unknown,
	) => Promise<readonly unknown[]>;

	/**
	 * Get file content at specific commit.
	 */
	readonly getFileAtCommit: (
		filePath: string,
		commit: string,
	) => Promise<string>;
};
