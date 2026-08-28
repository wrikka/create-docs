/**
 * Domain models for content linting
 */
export interface LintRule {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly severity: "error" | "warning" | "info";
	readonly enabled: boolean;
}

export interface LintIssue {
	readonly ruleId: string;
	readonly message: string;
	readonly line: number;
	readonly column: number;
	readonly severity: "error" | "warning" | "info";
}

export const createLintRule = (
	id: string,
	name: string,
	description: string,
	severity: LintRule["severity"],
	enabled: boolean = true,
): LintRule => ({
	id,
	name,
	description,
	severity,
	enabled,
});

export const createLintIssue = (
	ruleId: string,
	message: string,
	line: number,
	column: number,
	severity: LintIssue["severity"],
): LintIssue => ({
	ruleId,
	message,
	line,
	column,
	severity,
});
