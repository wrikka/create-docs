/**
 * Umami adapter implementation.
 * Provides Umami analytics integration via the REST tracking API.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { AnalyticsPort } from "../ports/analytics-port";
import type { AnalyticsConfig, AnalyticsEvent } from "../types/analytics";

type UmamiAnalyticsConfig = AnalyticsConfig & {
	readonly umamiHost?: string;
	readonly endpoint?: string;
};

export const createUmamiAdapter = (siteId: string): AnalyticsPort => {
	if (!siteId.trim()) {
		throw configError("Umami siteId is required", {
			context: { siteId },
			hint: "Pass a valid Umami website ID to createUmamiAdapter.",
		});
	}

	const resolveHost = (
		config: UmamiAnalyticsConfig | undefined,
	): string | undefined => config?.umamiHost ?? config?.endpoint;

	const resolveTrackingEndpoint = (host: string): string => {
		const normalized = host.replace(/\/+$/, "");
		return `${normalized}/api/collect`;
	};

	const resolveUrl = (event: AnalyticsEvent, host: string): string =>
		event.url ?? (typeof location !== "undefined" ? location.href : `${host}/`);

	return {
		track: async (event: unknown, config?: unknown) => {
			const analyticsEvent = event as AnalyticsEvent;
			const cfg = config as UmamiAnalyticsConfig | undefined;
			const host = resolveHost(cfg);

			if (!host?.trim()) {
				throw configError("Umami host/endpoint is required", {
					context: { siteId, config },
					hint: "Provide umamiHost or endpoint in the analytics config.",
				});
			}

			const endpoint = resolveTrackingEndpoint(host);
			const url = resolveUrl(analyticsEvent, host);
			const payload = {
				type: analyticsEvent.type === "pageview" ? "pageview" : "event",
				payload: {
					website: siteId,
					url,
					...(analyticsEvent.type !== "pageview"
						? { name: analyticsEvent.type }
						: {}),
					...(analyticsEvent.target ? { title: analyticsEvent.target } : {}),
					...(analyticsEvent.query
						? { data: { query: analyticsEvent.query } }
						: {}),
				},
			};

			try {
				const response = await fetch(endpoint, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
					keepalive: true,
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw pluginError("Umami tracking failed", {
					context: { siteId, endpoint, event: analyticsEvent },
					hint: "Verify the Umami host is reachable and the siteId is correct.",
					cause: error,
				});
			}
		},

		init: async (config?: unknown) => {
			const cfg = config as UmamiAnalyticsConfig | undefined;
			const host = resolveHost(cfg);

			if (!host?.trim()) {
				throw configError("Umami host/endpoint is required", {
					context: { siteId, config },
					hint: "Provide umamiHost or endpoint in the analytics config.",
				});
			}

			try {
				const response = await fetch(host, { method: "HEAD" });
				if (!response.ok && response.status !== 405) {
					throw new Error(`Host responded with HTTP ${response.status}`);
				}
			} catch (error) {
				throw pluginError("Umami initialization failed", {
					context: { siteId, host },
					cause: error,
				});
			}
		},
	};
};
