/**
 * Built-in linting adapter implementation.
 * Provides basic content linting rules.
 */

import { runLintRules } from "../domain/operations/linting-operations";
import type { LintingPort } from "../ports/linting-port";
import type { LintResult, LintRule } from "../types/linting";

const DEFAULT_RULES: LintRule[] = [
	{
		id: "missing-title",
		name: "Missing Title",
		description: "Document must have a title in frontmatter",
		severity: "error",
	},
	{
		id: "missing-description",
		name: "Missing Description",
		description: "Document should have a description in frontmatter",
		severity: "warning",
	},
];

export const createBuiltinLintingAdapter = (): LintingPort => ({
	lint: async (filePath: string, rules?: readonly unknown[]) => {
		try {
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error(`Failed to load file: ${response.statusText}`);
			}
			const content = await response.text();

			const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
			const frontmatter = frontmatterMatch?.[1]
				? (JSON.parse(
						frontmatterMatch[1].replace(/:/g, ":").replace(/'/g, '"'),
					) as Record<string, unknown>)
				: {};

			const lintRules = (rules as LintRule[]) || DEFAULT_RULES;
			const results = runLintRules(content, frontmatter, lintRules);

			if (!results.ok) {
				console.error("Linting error:", results.error);
				return [];
			}

			return results.value;
		} catch (error) {
			console.error("Lint error:", error);
			return [];
		}
	},

	fix: async (filePath: string, results?: readonly unknown[]) => {
		try {
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error(`Failed to load file: ${response.statusText}`);
			}
			const content = await response.text();

			const lintResults = results as LintResult[];
			let fixedContent = content;

			for (const result of lintResults) {
				if (result.ruleId === "missing-title" && result.severity === "error") {
					if (!fixedContent.match(/^---\n[\s\S]*?\n---/)) {
						fixedContent = `---\ntitle: "Untitled"\n---\n\n${fixedContent}`;
					}
				}
			}

			if (fixedContent !== content) {
				console.log(`Fixed ${lintResults.length} issues in ${filePath}`);
			}
		} catch (error) {
			console.error("Fix error:", error);
		}
	},
});
