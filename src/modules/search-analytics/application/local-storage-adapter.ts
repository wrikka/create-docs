/**
 * Local storage adapter implementation.
 * Provides search analytics using browser local storage.
 */

import type { SearchAnalyticsPort } from "../ports/search-analytics-port";
import type { SearchEvent } from "../types/search-analytics";

const STORAGE_KEY = "search-analytics-events";
const MAX_EVENTS = 1000;

export const createLocalStorageAdapter = (): SearchAnalyticsPort => ({
	trackEvent: async (event: SearchEvent, _config?: unknown) => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			const events: SearchEvent[] = stored ? JSON.parse(stored) : [];

			events.push(event);

			if (events.length > MAX_EVENTS) {
				events.shift();
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
		} catch (error) {
			console.error("Failed to track search event:", error);
		}
	},

	getAnalytics: async (dateRange?: unknown, _config?: unknown) => {
		if (typeof window === "undefined") {
			return [];
		}

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) {
				return [];
			}

			const events: SearchEvent[] = JSON.parse(stored);

			if (dateRange && typeof dateRange === "object") {
				const { since, until } = dateRange as {
					since?: string;
					until?: string;
				};
				if (since || until) {
					return events.filter((event) => {
						const eventDate = new Date(event.timestamp);
						if (since && eventDate < new Date(since)) return false;
						if (until && eventDate > new Date(until)) return false;
						return true;
					});
				}
			}

			return events;
		} catch (error) {
			console.error("Failed to get search analytics:", error);
			return [];
		}
	},
});
