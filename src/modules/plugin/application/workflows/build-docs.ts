/**
 * Use case: full docs build pipeline. Orchestrates:
 *   1. scan docs dir → DocFile[]
 *   2. load+parse each file → DocPage[]
 *   3. build sidebar, nav, search index
 *   4. produce virtual module source codes
 *
 * All I/O is delegated through ports; this function is fully testable with in-memory adapters.
 */

import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import { processDocsWorkflow } from "@create-docs/modules/content";
import { buildNav, buildSidebar } from "@create-docs/modules/navigation";
import { indexPages } from "@create-docs/modules/search";
import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import type { DocsLoader } from "../../ports";
import {
	buildVirtualModules,
	type VirtualModuleSet,
} from "../usecases/build-virtual-modules";

export interface BuildDocsInput {
	readonly config: ResolvedDocsConfig;
	readonly loader: DocsLoader;
	/** Optional page transformation hook. Invoked on each page after parsing. */
	readonly transformPage?: (
		page: import("@create-docs/modules/content").DocPage,
	) =>
		| import("@create-docs/modules/content").DocPage
		| Promise<import("@create-docs/modules/content").DocPage>;
}

export type BuildDocs = (
	input: BuildDocsInput,
) => Promise<Result<VirtualModuleSet, AppError>>;

export const buildDocs: BuildDocs = async ({
	config,
	loader,
	transformPage,
}) => {
	const loaded = await loader.loadAll(config);
	if (!loaded.ok) return loaded;
	let pages = loaded.value;

	// Optional page transformation hook
	if (transformPage) {
		const next: import("@create-docs/modules/content").DocPage[] = [];
		for (const p of pages) next.push(await transformPage(p));
		pages = next;
	}

	// Sidebar: prefer explicit config, otherwise auto-generate from pages
	const sidebarResult = buildSidebar({
		configured: config.sidebar,
		pages,
	});
	if (!sidebarResult.ok) return sidebarResult;
	const sidebar = sidebarResult.value;

	// Nav from config
	const navResult = buildNav(config.nav);
	if (!navResult.ok) return navResult;
	const nav = navResult.value;

	// Search index
	const searchResult = indexPages(pages);
	if (!searchResult.ok) return searchResult;
	const searchIndex = searchResult.value;

	const vms = buildVirtualModules({ config, pages, sidebar, nav, searchIndex });
	if (!vms.ok) return vms;

	return ok(vms.value);
};

// Re-export for backwards-compat with adapter layer
export { processDocsWorkflow };
