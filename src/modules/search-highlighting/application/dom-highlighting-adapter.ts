/**
 * DOM highlighting adapter implementation.
 * Provides client-side search highlighting.
 */

import {
	applyHighlighting,
	findMatches,
} from "../domain/operations/highlighting-operations";
import type { HighlightingPort } from "../ports/highlighting-port";
import type { HighlightConfig } from "../types/highlighting";

export const createDomHighlightingAdapter = (): HighlightingPort => ({
	highlight: async (content: string, query: string, config?: unknown) => {
		const highlightConfig: HighlightConfig =
			config && typeof config === "object"
				? (config as HighlightConfig)
				: {
						enabled: true,
						caseSensitive: false,
						highlightClass: "search-highlight",
					};

		const matchesResult = findMatches(content, query, highlightConfig);
		if (!matchesResult.ok) {
			return content;
		}

		const highlighted = applyHighlighting(
			content,
			matchesResult.value,
			highlightConfig.highlightClass,
		);
		return highlighted;
	},
});
