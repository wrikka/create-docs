/**
 * Pure search analytics operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type {
	SearchAnalyticsConfig,
	SearchEvent,
} from "../../types/search-analytics";

export type SearchAnalyticsError = {
	readonly kind: "search-analytics-error";
	readonly message: string;
};

/**
 * Aggregate search queries by frequency.
 */
export const aggregateQueries = (
	events: readonly SearchEvent[],
): Result<Record<string, number>, SearchAnalyticsError> => {
	try {
		const counts: Record<string, number> = {};

		for (const event of events) {
			if (event.type === "query") {
				const query = event.query.toLowerCase();
				counts[query] = (counts[query] || 0) + 1;
			}
		}

		return ok(counts);
	} catch (error) {
		return err({
			kind: "search-analytics-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Calculate search success rate.
 */
export const calculateSuccessRate = (
	events: readonly SearchEvent[],
): Result<number, SearchAnalyticsError> => {
	try {
		const queryEvents = events.filter((e) => e.type === "query");
		const noResultEvents = events.filter((e) => e.type === "no-results");

		if (queryEvents.length === 0) return ok(100);

		const successRate =
			((queryEvents.length - noResultEvents.length) / queryEvents.length) * 100;
		return ok(successRate);
	} catch (error) {
		return err({
			kind: "search-analytics-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Validate search analytics config.
 */
export const validateSearchAnalyticsConfig = (
	config: SearchAnalyticsConfig,
): boolean => {
	if (!config.enabled) return false;
	return true;
};
