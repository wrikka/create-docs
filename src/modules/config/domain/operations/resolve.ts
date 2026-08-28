/**
 * Pure operations for building and merging configs.
 * No I/O. No mutation of inputs.
 */
import {
	DEFAULT_BASE_ROUTE,
	DEFAULT_DOCS_DIR,
} from "@create-docs/shared/constants";
import type {
	DocsConfig,
	DocsPluginOptions,
	ResolvedDocsConfig,
} from "../../types";
import { defaultDocsConfig } from "./defaults";

export type UserConfig = Partial<DocsConfig> & DocsPluginOptions;

export const resolveConfig = (user: UserConfig = {}): ResolvedDocsConfig => ({
	...defaultDocsConfig,
	...user,
	nav: user.nav ?? defaultDocsConfig.nav,
	sidebar: user.sidebar ?? defaultDocsConfig.sidebar,
	site: { ...defaultDocsConfig.site, ...(user.site ?? {}) },
	theme: mergeOptional(defaultDocsConfig.theme, user.theme),
	api: mergeOptional(defaultDocsConfig.api, user.api),
	search: mergeOptional(defaultDocsConfig.search, user.search),
	editLink: mergeOptional(defaultDocsConfig.editLink, user.editLink),
	lastUpdated: mergeOptional(defaultDocsConfig.lastUpdated, user.lastUpdated),
	docsDir: user.docsDir ?? DEFAULT_DOCS_DIR,
	baseRoute: user.baseRoute ?? DEFAULT_BASE_ROUTE,
});

const mergeOptional = <T>(
	a: T | undefined,
	b: T | undefined,
): T | undefined => {
	if (a === undefined) return b;
	if (b === undefined) return a;
	return { ...a, ...b };
};
