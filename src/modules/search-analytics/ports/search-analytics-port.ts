/**
 * Port for search analytics operations.
 */

import type { SearchEvent } from "../types/search-analytics";

export type SearchAnalyticsPort = {
	/**
	 * Track search event.
	 */
	readonly trackEvent: (event: SearchEvent, config: unknown) => Promise<void>;

	/**
	 * Get search analytics data.
	 */
	readonly getAnalytics: (
		dateRange: unknown,
		config: unknown,
	) => Promise<readonly SearchEvent[]>;
};
