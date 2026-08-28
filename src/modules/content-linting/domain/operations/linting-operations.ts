/**
 * Pure content linting operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { LintResult, LintRule } from "../../types/linting";

export type LintingError = {
	readonly kind: "linting-error";
	readonly message: string;
};

/**
 * Check for missing title in frontmatter.
 */
export const checkMissingTitle = (frontmatter: unknown): LintResult | null => {
	if (!frontmatter || typeof frontmatter !== "object") return null;
	const fm = frontmatter as Record<string, unknown>;
	if (!fm.title) {
		return {
			ruleId: "missing-title",
			message: "Document is missing a title",
			line: 1,
			column: 1,
			severity: "error",
		};
	}
	return null;
};

/**
 * Check for missing description in frontmatter.
 */
export const checkMissingDescription = (
	frontmatter: unknown,
): LintResult | null => {
	if (!frontmatter || typeof frontmatter !== "object") return null;
	const fm = frontmatter as Record<string, unknown>;
	if (!fm.description) {
		return {
			ruleId: "missing-description",
			message: "Document is missing a description",
			line: 1,
			column: 1,
			severity: "warning",
		};
	}
	return null;
};

/**
 * Run all lint rules on content.
 */
export const runLintRules = (
	_content: string,
	frontmatter: unknown,
	rules: readonly LintRule[],
): Result<readonly LintResult[], LintingError> => {
	try {
		const results: LintResult[] = [];

		for (const rule of rules) {
			if (rule.id === "missing-title") {
				const result = checkMissingTitle(frontmatter);
				if (result) results.push(result);
			}
			if (rule.id === "missing-description") {
				const result = checkMissingDescription(frontmatter);
				if (result) results.push(result);
			}
		}

		return ok(results);
	} catch (error) {
		return err({
			kind: "linting-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
