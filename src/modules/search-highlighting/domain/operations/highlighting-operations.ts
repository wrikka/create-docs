/**
 * Pure search highlighting operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { HighlightConfig, HighlightMatch } from "../../types/highlighting";

export type HighlightingError = {
	readonly kind: "highlighting-error";
	readonly message: string;
};

/**
 * Find all matches of a query in text.
 */
export const findMatches = (
	text: string,
	query: string,
	config: HighlightConfig,
): Result<readonly HighlightMatch[], HighlightingError> => {
	try {
		if (query.length === 0) return ok([]);

		const matches: HighlightMatch[] = [];
		const searchRegex = new RegExp(
			query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
			config.caseSensitive ? "g" : "gi",
		);

		let match: RegExpExecArray | null = searchRegex.exec(text);
		while (match !== null) {
			matches.push({
				text: match[0],
				start: match.index,
				end: match.index + match[0].length,
			});
			match = searchRegex.exec(text);
		}

		return ok(matches);
	} catch (error) {
		return err({
			kind: "highlighting-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Apply highlighting to text with matches.
 */
export const applyHighlighting = (
	text: string,
	matches: readonly HighlightMatch[],
	highlightClass: string,
): string => {
	if (matches.length === 0) return text;

	let result = "";
	let lastIndex = 0;

	for (const match of matches) {
		result += text.slice(lastIndex, match.start);
		result += `<mark class="${highlightClass}">${match.text}</mark>`;
		lastIndex = match.end;
	}

	result += text.slice(lastIndex);
	return result;
};
