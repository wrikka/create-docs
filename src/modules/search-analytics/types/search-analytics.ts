/**
 * Search analytics types for tracking search behavior.
 */

export type SearchAnalyticsConfig = {
	readonly enabled: boolean;
	readonly trackQueries: boolean;
	readonly trackClicks: boolean;
};

export type SearchEvent = {
	readonly type: "query" | "click" | "no-results";
	readonly query: string;
	readonly timestamp: string;
	readonly resultCount?: number;
};
