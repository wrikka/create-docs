/**
 * Use case: build the sidebar from either a user-defined config or
 * the scanned docs directory.
 */

import type { DocFile, DocPage } from "@create-docs/modules/content";
import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import { ok } from "@create-docs/shared/types/result";
import {
	groupDocsByFolder,
	type SidebarSource,
} from "../../domain/operations/group";
import {
	sortSidebarGroups,
	sortSidebarItems,
} from "../../domain/operations/sort";
import type { SidebarGroup } from "../../types";

export interface BuildSidebarInput {
	/** Explicit sidebar from config (overrides auto-generation). */
	readonly configured?: readonly SidebarGroup[];
	/** All scanned doc files (used when no explicit sidebar). */
	readonly docs?: readonly DocFile[];
	/** All built doc pages (used as a richer source when available). */
	readonly pages?: readonly DocPage[];
}

export type BuildSidebar = (
	input: BuildSidebarInput,
) => Result<readonly SidebarGroup[], AppError>;

export const buildSidebar: BuildSidebar = ({ configured, docs, pages }) => {
	if (configured && configured.length > 0) {
		const sorted = configured.map((g) => ({
			...g,
			items: sortSidebarItems(g.items),
		}));
		return ok(sortSidebarGroups(sorted));
	}
	const sources: readonly SidebarSource[] =
		pages !== undefined && pages.length > 0 ? pages : (docs ?? []);
	if (sources.length === 0) return ok([]);
	return ok(sortSidebarGroups(groupDocsByFolder(sources)));
};
