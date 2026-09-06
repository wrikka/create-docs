/**
 * create-docs runtime — SolidJS app shell (VitePress-style layouts,
 * Scalar-style API reference) driven by an injected data source.
 */

export type { PageViewRecord } from "./analytics";
export {
	getPageViews,
	resetPageViews,
	trackPageView,
} from "./analytics";
export type { EndpointChange } from "./api-diff";
export { diffApiCollections } from "./api-diff";
export { createDocsApp, mountDocsApp } from "./app";
// Components (for custom pages/layouts)
export { ApiPlayground } from "./components/ApiPlayground";
export { AskAiDialog } from "./components/AskAiDialog";
export { BackToTop } from "./components/BackToTop";
export { Breadcrumbs } from "./components/Breadcrumbs";
export { CollectionDropdown } from "./components/CollectionDropdown";
export { DocMarkdown } from "./components/DocMarkdown";
export { DocPrevNext } from "./components/DocPrevNext";
export { DocToc } from "./components/DocToc";
export { GitHubStats } from "./components/GitHubStats";
export { Head } from "./components/Head";
export { LocaleDropdown } from "./components/LocaleDropdown";
export { PageActions } from "./components/PageActions";
export { RelatedDocs } from "./components/RelatedDocs";
export { ScrollProgress } from "./components/ScrollProgress";
export {
	SearchPalette,
	searchOpen,
	setSearchOpen,
} from "./components/SearchPalette";
export { SidebarNav } from "./components/SidebarNav";
export {
	SkeletonBlock,
	SkeletonPage,
	SkeletonText,
} from "./components/Skeleton";
export { ThemeToggle } from "./components/ThemeToggle";
export { TopNav } from "./components/TopNav";
export { VersionDropdown } from "./components/VersionDropdown";
export type {
	ApiCollection,
	DocsAppConfig,
	DocsAppFeatures,
	DocsVersion,
	GitHubConfig,
	HomeConfig,
	HomeFeature,
	I18nConfig,
	LocaleInfo,
	MarkdownConfig,
	PluginInfo,
	VersionsConfig,
} from "./config";
export type { DirMeta, StaticSourceOptions } from "./content";
export {
	createCompositeDataSource,
	createRemoteDataSource,
	createStaticDataSource,
	parseFrontmatter,
	queryDocs,
	relatedDocs,
} from "./content";
export { DocsProvider, useDocs } from "./context";
export { createDocsList, useCollections } from "./data";
export type {
	CommitInfo,
	Contributor,
	MilestoneInfo,
	ReleaseInfo,
	RepoStats,
} from "./github";
export {
	fetchCommits,
	fetchContributors,
	fetchMilestones,
	fetchReleases,
	fetchRepoStats,
} from "./github";
// Pages & layouts
export { DocsLayout } from "./layouts/DocsLayout";
export { AnalyticsPage } from "./pages/AnalyticsPage";
export { ApiDiffPage } from "./pages/ApiDiffPage";
export { ApiEndpointPage } from "./pages/ApiEndpointPage";
export { ChangelogPage } from "./pages/ChangelogPage";
export { CollectionPage } from "./pages/CollectionPage";
export { CommunityPage } from "./pages/CommunityPage";
export { DocPage } from "./pages/DocPage";
export { HomePage } from "./pages/HomePage";
export { PluginsPage } from "./pages/PluginsPage";
export { setupPwa } from "./pwa";
export { createDocsRouter } from "./router";
export type { SeoInput } from "./seo";
export {
	generateAtom,
	generateJsonFeed,
	generateLlmsTxt,
	generateRobots,
	generateRss,
	generateSitemap,
} from "./seo";
export { initTheme, useTheme } from "./theme";
export type {
	ApiEndpoint,
	ApiParameter,
	AskInput,
	AskResult,
	CollectionMeta,
	DocContent,
	DocEntry,
	DocsDataSource,
	HttpMethod,
	SearchResult,
} from "./types";
