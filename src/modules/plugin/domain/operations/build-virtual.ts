/**
 * Pure operations for generating virtual module source code (Vite-loadable ESM).
 * No I/O, no exceptions. Returns strings ready to be emitted as virtual module code.
 */

import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import type { DocPage, FilePath } from "@create-docs/modules/content";
import type { NavSection, SidebarGroup } from "@create-docs/modules/navigation";
import {
	VIRTUAL_DATA,
	VIRTUAL_NAV,
	VIRTUAL_SEARCH_INDEX,
	VIRTUAL_SIDEBAR,
} from "@create-docs/modules/plugin/types";
import type { SearchIndex } from "@create-docs/modules/search";
import { isString } from "@create-docs/shared/utils/object";

const serializeForESM = (value: unknown): string =>
	JSON.stringify(value, replacer, 2);

const replacer = (_key: string, value: unknown): unknown => {
	if (value === undefined) return undefined;
	return value;
};

export const buildDocsDataModule = (pages: readonly DocPage[]): string => {
	const exported = pages.map((p) => ({
		id: String(p.id),
		slug: String(p.slug),
		title: p.title,
		description: p.description,
		frontmatter: p.frontmatter,
		rawContent: p.rawContent,
		content: p.content,
		filePath: String(p.filePath),
	}));
	return `export const docsData = ${serializeForESM(exported)};`;
};

export const buildSidebarModule = (groups: readonly SidebarGroup[]): string =>
	`export const sidebar = ${serializeForESM(groups)};`;

export const buildNavModule = (sections: readonly NavSection[]): string =>
	`export const nav = ${serializeForESM(sections)};`;

export const buildSearchIndexModule = (index: SearchIndex): string =>
	`export const searchIndex = ${serializeForESM(index.entries)};`;

export const buildConfigModule = (
	config: ResolvedDocsConfig,
): string => `export const docsConfig = ${serializeForESM(config)};
export const site = ${serializeForESM(config.site)};
export const nav = ${serializeForESM(config.nav)};
export const sidebar = ${serializeForESM(config.sidebar)};
export const api = ${serializeForESM(config.api)};
export const search = ${serializeForESM(config.search)};
export const editLink = ${serializeForESM(config.editLink)};
export const lastUpdated = ${serializeForESM(config.lastUpdated)};`;

export const resolveVirtualModule = (id: string): string | undefined => {
	if (id === VIRTUAL_DATA) return "data";
	if (id === VIRTUAL_SIDEBAR) return "sidebar";
	if (id === VIRTUAL_NAV) return "nav";
	if (id === VIRTUAL_SEARCH_INDEX) return "search-index";
	return undefined;
};

export const isVirtualDocsModule = (id: string): boolean =>
	id.startsWith("virtual:docs/");

export const pathToFilePath = (p: string): FilePath => p as unknown as FilePath;

export const isMarkdownPath = (p: string): boolean => {
	if (!isString(p)) return false;
	return p.endsWith(".md") || p.endsWith(".mdoc");
};
