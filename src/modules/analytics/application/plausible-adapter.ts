/**
 * Plausible adapter implementation.
 * Provides Plausible analytics integration via the REST event API.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { AnalyticsPort } from "../ports/analytics-port";
import type { AnalyticsConfig, AnalyticsEvent } from "../types/analytics";

type PlausibleAnalyticsConfig = AnalyticsConfig & {
	readonly apiHost?: string;
	readonly endpoint?: string;
};

const PLAUSIBLE_DEFAULT_HOST = "https://plausible.io";

export const createPlausibleAdapter = (domain: string): AnalyticsPort => {
	if (!domain.trim()) {
		throw configError("Plausible domain is required", {
			context: { domain },
			hint: "Pass the site domain to createPlausibleAdapter.",
		});
	}

	const resolveApiHost = (
		config: PlausibleAnalyticsConfig | undefined,
	): string =>
		(config?.apiHost ?? config?.endpoint ?? PLAUSIBLE_DEFAULT_HOST).replace(
			/\/+$/,
			"",
		);

	const resolveTrackingEndpoint = (apiHost: string): string =>
		apiHost.endsWith("/api/event") ? apiHost : `${apiHost}/api/event`;

	const resolveUrl = (event: AnalyticsEvent): string => {
		if (event.url) return event.url;

		if (typeof location !== "undefined") {
			return location.href;
		}

		return `https://${domain}${
			event.type === "pageview" ? "/" : `/${event.type}`
		}`;
	};

	return {
		track: async (event: unknown, config?: unknown) => {
			const analyticsEvent = event as AnalyticsEvent;
			const cfg = config as PlausibleAnalyticsConfig | undefined;
			const apiHost = resolveApiHost(cfg);
			const endpoint = resolveTrackingEndpoint(apiHost);
			const url = resolveUrl(analyticsEvent);

			const payload = {
				name: analyticsEvent.type,
				url,
				domain,
				props: {
					...(analyticsEvent.query ? { query: analyticsEvent.query } : {}),
					...(analyticsEvent.target ? { target: analyticsEvent.target } : {}),
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
				throw pluginError("Plausible tracking failed", {
					context: { domain, endpoint, event: analyticsEvent },
					hint: "Verify the Plausible API host is reachable and the domain is correct.",
					cause: error,
				});
			}
		},

		init: async (config?: unknown) => {
			const cfg = config as PlausibleAnalyticsConfig | undefined;
			const apiHost = resolveApiHost(cfg);

			try {
				const response = await fetch(apiHost, { method: "HEAD" });
				if (!response.ok && response.status !== 404) {
					throw new Error(`Host responded with HTTP ${response.status}`);
				}
			} catch (error) {
				throw pluginError("Plausible initialization failed", {
					context: { domain, apiHost },
					cause: error,
				});
			}
		},
	};
};
