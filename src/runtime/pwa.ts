import type { DocsAppConfig } from "./config";

/**
 * Enables PWA support: injects the web-app manifest link and theme-color
 * meta, then registers `/sw.js` when the browser supports service workers.
 *
 * The consumer is responsible for shipping `manifest.webmanifest` and
 * `sw.js` as static assets (e.g. in `public/`).
 */
export function setupPwa(config: DocsAppConfig): void {
	if (!config.features?.pwa) return;
	if (typeof document === "undefined") return;

	if (!document.querySelector('link[rel="manifest"]')) {
		const link = document.createElement("link");
		link.rel = "manifest";
		link.href = "/manifest.webmanifest";
		document.head.appendChild(link);
	}

	if (!document.querySelector('meta[name="theme-color"]')) {
		const meta = document.createElement("meta");
		meta.name = "theme-color";
		meta.content =
			config.theme?.defaultMode === "light" ? "#ffffff" : "#0b0d12";
		document.head.appendChild(meta);
	}

	const canRegister =
		"serviceWorker" in navigator &&
		(location.protocol === "https:" ||
			location.hostname === "localhost" ||
			location.hostname === "127.0.0.1");
	if (!canRegister) return;

	navigator.serviceWorker.register("/sw.js").catch(() => {
		// Service worker missing or registration blocked — offline mode off.
	});
}
