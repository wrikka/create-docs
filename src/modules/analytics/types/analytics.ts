/**
 * Analytics types for tracking page views and user engagement.
 */

export type AnalyticsConfig = {
	readonly provider: "plausible" | "umami" | "google-analytics" | "none";
	readonly siteId?: string;
	readonly domain?: string;
};

export type AnalyticsEvent = {
	readonly type: "pageview" | "search" | "click";
	readonly url?: string;
	readonly query?: string;
	readonly target?: string;
};
