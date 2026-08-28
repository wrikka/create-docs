/**
 * create-docs — Public API
 *
 * Vite plugin for documentation sites, built on Functional Clean Architecture
 * with Vertical Slice Architecture. SolidJS-only support.
 *
 * ## Layer Map
 *   - `src/shared/`     — pure utilities, types, errors (no dependencies)
 *   - `src/modules/`    — feature modules (content, navigation, search, config, plugin)
 *   - `src/adapters/`   — I/O implementations (Node FS, Vite, config loader)
 *   - `src/presentation/` — entry points (Vite plugin, Solid components)
 *
 * ## Quick Start
 *   ```ts
 *   import { docsPlugin } from 'create-docs';
 *
 *   export default defineConfig({
 *     plugins: [docsPlugin({ site: { title: 'My Docs' } })]
 *   });
 *   ```
 */

// --- Adapters (advanced usage) ---
export {
	createFsDocsLoader,
	createMemoryDirectoryScanner,
	createMemoryFileReader,
	createNodeConfigLoader,
	createNodeDocsWatcher,
	memoryFileSystem,
	nodeDirectoryScanner,
	nodeFileReader,
	nodeFileWatcher,
} from "./adapters";
export type {
	CodeBlock,
	CodeBlockOptions,
} from "./code-block-enhancements";
// --- Code Block Enhancements ---
export { enhanceCodeBlocks } from "./code-block-enhancements";
export type {
	ApiConfig,
	ApiEndpoint,
	AuthType,
	DocsConfig,
	DocsPluginOptions,
	EditLinkConfig,
	HttpMethod,
	LastUpdatedConfig,
	ResolvedDocsConfig,
	SearchConfig,
	SiteConfig,
	ThemeConfig,
} from "./config";
// --- Config (default + types + operations) ---
export {
	defaultDocsConfig,
	resolveConfig,
	validateDocsConfig,
} from "./config";
export type {
	BadgeVariant,
	DocFile,
	DocId,
	DocPage,
	DocSlug,
	FilePath,
	Frontmatter,
	ParsedContent,
} from "./content";
// --- Content (pages, frontmatter, parsing) ---
export {
	buildDocPage,
	buildDocPageFromRaw,
	parseFrontmatter,
} from "./content";
export type {
	ContentValidator,
	ValidationError,
	ValidationOptions,
	ValidationResult,
} from "./content-validation";
// --- Content Validation ---
export { validate } from "./content-validation";
export type {
	CommitOptions,
	GitAdapter,
	GitStatus,
	PushOptions,
} from "./live-editor";
// --- Live Editor with Git Integration ---
export {
	commitAndPush,
	loadEditorState,
	saveFile,
} from "./live-editor";
export type {
	NavItem,
	NavSection,
	Sidebar,
	SidebarGroup,
	SidebarItem,
} from "./navigation";
// --- Navigation (sidebar, nav) — canonical owner of nav/sidebar types ---
export {
	buildNav,
	buildSidebar,
	formatGroupTitle,
	groupDocsByFolder,
} from "./navigation";
export type { VirtualModuleSet } from "./plugin";
// --- Plugin module (orchestration) ---
export {
	buildVirtualModules,
	isMarkdownPath,
	isVirtualDocsModule,
} from "./plugin";
export type { DocsPluginConfig } from "./presentation/vite-plugin";
// --- Presentation (Vite plugin + Solid components) ---
export {
	default,
	docsPlugin,
	transformMarkdown,
} from "./presentation/vite-plugin";
export type { SearchEntry, SearchIndex } from "./search";
// --- Search (index + query) ---
export {
	buildSearchIndex,
	indexPages,
	pageToSearchEntry,
	search,
} from "./search";
export type {
	MetaTagGenerator,
	MetaTags,
	SeoOptions,
} from "./seo-optimization";
// --- SEO Optimization ---
export { optimizeSeo } from "./seo-optimization";
// --- SolidJS UI Components ---
// Note: Components are in presentation/solid/ directory
// Import directly in your Solid project
// --- Constants ---
export {
	DEFAULT_BASE_ROUTE,
	DEFAULT_DOCS_DIR,
	PLUGIN_NAME,
	SUPPORTED_EXTENSIONS,
	VIRTUAL_PREFIX,
} from "./shared/constants";
export type { Brand, Either, Option, Result } from "./shared/types";
// --- Shared (FP primitives — re-exported for downstream modules) ---
export {
	err,
	isErr,
	isNone,
	isOk,
	isSome,
	left,
	none,
	ok,
	right,
	some,
} from "./shared/types";
export type {
	ContentParser,
	TocItem,
	TocOptions,
} from "./toc-generator";
// --- TOC Generator ---
export {
	generateFlatToc,
	generateToc,
} from "./toc-generator";
