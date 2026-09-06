import { RouterProvider } from "@tanstack/solid-router";
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import type { DocsAppConfig } from "./config";
import { DocsProvider } from "./context";
import { createDocsRouter } from "./router";
import "./theme.css";
import "./markdown-content.css";

/** App root component factory — mount with your own render call. */
export function createDocsApp(config: DocsAppConfig): () => JSX.Element {
	const router = createDocsRouter(config);
	return () => (
		<DocsProvider config={config}>
			<RouterProvider router={router} />
		</DocsProvider>
	);
}

/** One-call mount. Looks up `#root` when no element is given. */
export function mountDocsApp(
	config: DocsAppConfig,
	el?: HTMLElement | null,
): void {
	const root = el ?? document.getElementById("root");
	if (!root) throw new Error("create-docs: root element not found");
	render(createDocsApp(config), root);
}
