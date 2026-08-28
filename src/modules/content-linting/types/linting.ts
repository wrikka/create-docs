/**
 * Content linting types for validating documentation content.
 */

export type LintRule = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly severity: "error" | "warning" | "info";
};

export type LintResult = {
	readonly ruleId: string;
	readonly message: string;
	readonly line: number;
	readonly column: number;
	readonly severity: "error" | "warning" | "info";
};
