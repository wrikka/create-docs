/**
 * Port for content linting operations.
 */

export type LintingPort = {
	/**
	 * Lint content file.
	 */
	readonly lint: (
		filePath: string,
		rules: readonly unknown[],
	) => Promise<readonly unknown[]>;

	/**
	 * Fix lint issues.
	 */
	readonly fix: (
		filePath: string,
		results: readonly unknown[],
	) => Promise<void>;
};
