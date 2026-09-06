import {
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/solid-router";
import type { DocsAppConfig } from "./config";
import { findApiCollection } from "./context";
import { DocsLayout } from "./layouts/DocsLayout";
import { ApiEndpointPage } from "./pages/ApiEndpointPage";
import { CollectionPage } from "./pages/CollectionPage";
import { DocPage } from "./pages/DocPage";
import { HomePage } from "./pages/HomePage";

export function createDocsRouter(config: DocsAppConfig) {
	const rootRoute = createRootRoute({
		component: () => <DocsLayout />,
	});

	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		...(config.home
			? { component: HomePage }
			: {
					beforeLoad: () => {
						const target =
							config.defaultCollection ??
							config.apiCollections?.[0]?.id ??
							"docs";
						throw redirect({
							to: "/$collection",
							params: { collection: target },
						});
					},
				}),
	});

	const collectionRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/$collection",
		component: CollectionPage,
	});

	// One detail route; the page component switches on collection type.
	const detailRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/$collection/$docId",
		component: () => {
			const params = detailRoute.useParams();
			return findApiCollection(config, params().collection) ? (
				<ApiEndpointPage />
			) : (
				<DocPage />
			);
		},
	});

	const routeTree = rootRoute.addChildren([
		indexRoute,
		collectionRoute,
		detailRoute,
	]);

	return createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true,
	});
}
