/**
 * Port for analytics operations.
 */

import type { AnalyticsEvent } from "../types/analytics";

export type AnalyticsPort = {
	/**
	 * Track analytics event.
	 */
	readonly track: (event: AnalyticsEvent, config: unknown) => Promise<void>;

	/**
	 * Initialize analytics.
	 */
	readonly init: (config: unknown) => Promise<void>;
};
