import {
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/solid-router";
import { trackPageView } from "./analytics";
import type { DocsAppConfig } from "./config";
import { findApiCollection } from "./context";
import { DocsLayout } from "./layouts/DocsLayout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ApiDiffPage } from "./pages/ApiDiffPage";
import { ApiEndpointPage } from "./pages/ApiEndpointPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DocPage } from "./pages/DocPage";
import { HomePage } from "./pages/HomePage";
import { PluginsPage } from "./pages/PluginsPage";

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

	const extraRoutes = [];
	if (config.github?.releases) {
		const changelogRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "/changelog",
			component: ChangelogPage,
		});
		extraRoutes.push(changelogRoute);
	}

	if (config.github?.contributors) {
		const communityRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "/community",
			component: CommunityPage,
		});
		extraRoutes.push(communityRoute);
	}

	if (config.features?.analytics) {
		const analyticsRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "/analytics",
			component: AnalyticsPage,
		});
		extraRoutes.push(analyticsRoute);
	}

	if (config.apiDiff) {
		const apiDiffRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "/api-diff",
			component: ApiDiffPage,
		});
		extraRoutes.push(apiDiffRoute);
	}

	if (config.plugins?.length) {
		const pluginsRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "/plugins",
			component: PluginsPage,
		});
		extraRoutes.push(pluginsRoute);
	}

	const routeTree = rootRoute.addChildren([
		indexRoute,
		collectionRoute,
		detailRoute,
		...extraRoutes,
	]);

	const router = createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true,
	});

	if (config.features?.analytics) {
		router.subscribe("onResolved", ({ toLocation }) => {
			trackPageView(toLocation.pathname, config.analytics?.endpoint);
		});
	}

	return router;
}
