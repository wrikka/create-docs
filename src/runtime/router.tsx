import {
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from "@tanstack/solid-router";
import { trackPageView } from "./analytics";
import { NotFound } from "./components/NotFound";
import type { DocsAppConfig } from "./config";
import { findApiCollection } from "./context";
import { DocsLayout } from "./layouts/DocsLayout";
import { AbTestPage } from "./pages/AbTestPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ApiDiffPage } from "./pages/ApiDiffPage";
import { ApiEndpointPage } from "./pages/ApiEndpointPage";
import { BuilderPage } from "./pages/BuilderPage";
import { ChangelogPage } from "./pages/ChangelogPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CreatePage } from "./pages/CreatePage";
import { DocPage } from "./pages/DocPage";
import { EditPage } from "./pages/EditPage";
import { HomePage } from "./pages/HomePage";
import { IssuesPage } from "./pages/IssuesPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { PluginsPage } from "./pages/PluginsPage";
import { ShowcasePage } from "./pages/ShowcasePage";

export function createDocsRouter(config: DocsAppConfig) {
	const rootRoute = createRootRoute({
		component: () => <DocsLayout />,
		errorComponent: () => <NotFound />,
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
		path: "$collection",
		component: CollectionPage,
	});

	// One detail route; the page component switches on collection type.
	const editRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "edit/$collection/$docId",
		component: EditPage,
	});

	const detailRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "$collection/$docId",
		component: () => {
			const params = detailRoute.useParams();
			return findApiCollection(config, params().collection) ? (
				<ApiEndpointPage />
			) : (
				<DocPage />
			);
		},
	});

	const createPageRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "create",
		component: CreatePage,
	});

	const builderRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "builder",
		component: BuilderPage,
	});

	const abTestRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "ab/$collection/$docId",
		component: AbTestPage,
	});

	const extraRoutes = [];
	if (config.github?.releases) {
		const changelogRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "changelog",
			component: ChangelogPage,
		});
		extraRoutes.push(changelogRoute);
	}

	if (config.github?.contributors) {
		const communityRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "community",
			component: CommunityPage,
		});
		extraRoutes.push(communityRoute);
	}

	if (config.github?.issues) {
		const issuesRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "issues",
			component: IssuesPage,
		});
		extraRoutes.push(issuesRoute);
	}

	if (config.features?.analytics) {
		const analyticsRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "analytics",
			component: AnalyticsPage,
		});
		extraRoutes.push(analyticsRoute);
	}

	if (config.apiDiff) {
		const apiDiffRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "api-diff",
			component: ApiDiffPage,
		});
		extraRoutes.push(apiDiffRoute);
	}

	if (config.plugins?.length) {
		const pluginsRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: "plugins",
			component: PluginsPage,
		});
		extraRoutes.push(pluginsRoute);
	}

	const showcaseRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "showcase",
		component: ShowcasePage,
	});
	extraRoutes.push(showcaseRoute);

	const oauthCallbackRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "auth/github/callback",
		component: OAuthCallbackPage,
	});
	extraRoutes.push(oauthCallbackRoute);

	const routeTree = rootRoute.addChildren([
		indexRoute,
		createPageRoute,
		editRoute,
		builderRoute,
		abTestRoute,
		...extraRoutes,
		collectionRoute,
		detailRoute,
	]);

	const router = createRouter({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultNotFoundComponent: NotFound,
	});

	if (config.features?.analytics) {
		router.subscribe("onResolved", ({ toLocation }) => {
			trackPageView(toLocation.pathname, config.analytics?.endpoint);
		});
	}

	return router;
}
