/**
 * create-docs runtime — SolidJS app shell (VitePress-style layouts,
 * Scalar-style API reference) driven by an injected data source.
 */

export { createDocsApp, mountDocsApp } from "./app";
// Components (for custom pages/layouts)
export { ApiPlayground } from "./components/ApiPlayground";
export { AskAiDialog } from "./components/AskAiDialog";
export { CollectionDropdown } from "./components/CollectionDropdown";
export { DocMarkdown } from "./components/DocMarkdown";
export { DocPrevNext } from "./components/DocPrevNext";
export { DocToc } from "./components/DocToc";
export { PageActions } from "./components/PageActions";
export {
	SearchPalette,
	searchOpen,
	setSearchOpen,
} from "./components/SearchPalette";
export { SidebarNav } from "./components/SidebarNav";
export { ThemeToggle } from "./components/ThemeToggle";
export { TopNav } from "./components/TopNav";
export type {
	ApiCollection,
	DocsAppConfig,
	DocsAppFeatures,
	HomeConfig,
	HomeFeature,
	MarkdownConfig,
} from "./config";
export { DocsProvider, useDocs } from "./context";
export { createDocsList, useCollections } from "./data";
// Pages & layouts
export { DocsLayout } from "./layouts/DocsLayout";
export { ApiEndpointPage } from "./pages/ApiEndpointPage";
export { CollectionPage } from "./pages/CollectionPage";
export { DocPage } from "./pages/DocPage";
export { HomePage } from "./pages/HomePage";
export { createDocsRouter } from "./router";
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
