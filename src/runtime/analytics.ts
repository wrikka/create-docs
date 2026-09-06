/**
 * Lightweight, privacy-friendly page-view analytics.
 *
 * Counts are stored in localStorage so the `/analytics` dashboard works
 * with zero backend. When `config.analytics.endpoint` is set, each view is
 * also beaconed to that URL for server-side aggregation.
 */

export interface PageViewRecord {
	path: string;
	views: number;
	lastVisit: string;
}

const STORAGE_KEY = "create-docs:analytics";

export function trackPageView(path: string, endpoint?: string): void {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const data: PageViewRecord[] = raw ? JSON.parse(raw) : [];
		const rec = data.find((r) => r.path === path);
		if (rec) {
			rec.views += 1;
			rec.lastVisit = new Date().toISOString();
		} else {
			data.push({ path, views: 1, lastVisit: new Date().toISOString() });
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Storage unavailable (private mode, quota) — skip local tracking.
	}

	if (endpoint) {
		try {
			navigator.sendBeacon(endpoint, JSON.stringify({ path, t: Date.now() }));
		} catch {
			// Beacon unsupported — skip remote tracking.
		}
	}
}

export function getPageViews(): PageViewRecord[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const data = JSON.parse(raw) as PageViewRecord[];
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

export function resetPageViews(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
