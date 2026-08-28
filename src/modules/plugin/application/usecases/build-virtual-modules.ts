/**
 * Use case: build all virtual module source codes from a resolved config and pages.
 * Returns a pure data structure (no Vite coupling).
 */

import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import type { DocPage } from "@create-docs/modules/content";
import type { NavSection, SidebarGroup } from "@create-docs/modules/navigation";
import type { SearchIndex } from "@create-docs/modules/search";
import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import {
	buildConfigModule,
	buildDocsDataModule,
	buildNavModule,
	buildSearchIndexModule,
	buildSidebarModule,
} from "../../domain/operations/build-virtual";

export interface VirtualModuleSet {
	readonly "virtual:docs/data": string;
	readonly "virtual:docs/sidebar": string;
	readonly "virtual:docs/nav": string;
	readonly "virtual:docs/search-index": string;
	readonly "virtual:docs/config": string;
}

export interface BuildVirtualModulesInput {
	readonly config: ResolvedDocsConfig;
	readonly pages: readonly DocPage[];
	readonly sidebar: readonly SidebarGroup[];
	readonly nav: readonly NavSection[];
	readonly searchIndex: SearchIndex;
}

export type BuildVirtualModules = (
	input: BuildVirtualModulesInput,
) => Result<VirtualModuleSet, AppError>;

export const buildVirtualModules: BuildVirtualModules = ({
	config,
	pages,
	sidebar,
	nav,
	searchIndex,
}) =>
	ok({
		"virtual:docs/data": buildDocsDataModule(pages),
		"virtual:docs/sidebar": buildSidebarModule(sidebar),
		"virtual:docs/nav": buildNavModule(nav),
		"virtual:docs/search-index": buildSearchIndexModule(searchIndex),
		"virtual:docs/config": buildConfigModule(config),
	});
