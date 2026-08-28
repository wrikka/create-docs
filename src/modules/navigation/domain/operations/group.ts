/**
 * Pure operations for generating and formatting navigation structures.
 * No I/O. No mutation of inputs.
 */

import type { DocFile, DocPage } from "@create-docs/modules/content";
import { SIDEBAR_DEFAULT_GROUP_TITLE } from "@create-docs/shared/constants";
import { capitalize, titleCase } from "@create-docs/shared/utils/string";
import type { SidebarGroup, SidebarItem } from "../../types";
import { groupBy, sortBy } from "../shared/utils/array";

export interface GroupInput {
	readonly slug: string;
	readonly title: string;
	readonly order: number;
	readonly group?: string;
	readonly badge?: string;
	readonly badgeVariant?: SidebarItem["badgeVariant"];
}

/** Structural subset needed to derive a sidebar item. Both DocFile and DocPage satisfy it. */
export interface SidebarSource {
	readonly slug: DocFile["slug"] | DocPage["slug"];
	readonly group?: string;
	readonly order: number;
	readonly frontmatter: DocFile["frontmatter"];
}

/** Format a folder name into a human-readable group title. */
export const formatGroupTitle = (name: string): string => {
	if (name === "root") return SIDEBAR_DEFAULT_GROUP_TITLE;
	return titleCase(name);
};

/** Group doc files by their first path segment, sorting each by `order`. */
export const groupDocsByFolder = (
	docs: readonly SidebarSource[],
): readonly SidebarGroup[] => {
	const grouped = groupBy(docs, (d) => d.group ?? "root");
	const groups: SidebarGroup[] = [];
	for (const [key, items] of Object.entries(grouped)) {
		const sorted = sortBy(items, (i) => i.order);
		groups.push({
			title: formatGroupTitle(key),
			items: sorted.map(toSidebarItem),
		});
	}
	return groups.sort((a, b) => a.title.localeCompare(b.title));
};

const toSidebarItem = (doc: SidebarSource): SidebarItem => {
	const fm = doc.frontmatter as Record<string, unknown>;
	const item: SidebarItem = {
		title: deriveTitle(doc),
		slug: typeof doc.slug === "string" ? doc.slug : String(doc.slug),
	};
	if (typeof fm.badge === "string") {
		const withBadge: SidebarItem = { ...item, badge: fm.badge };
		if (isBadgeVariant(fm.badgeVariant)) {
			return { ...withBadge, badgeVariant: fm.badgeVariant };
		}
		return withBadge;
	}
	return item;
};

const deriveTitle = (doc: SidebarSource): string => {
	const fm = doc.frontmatter as Record<string, unknown>;
	if (typeof fm.title === "string" && fm.title.trim().length > 0)
		return fm.title;
	const slugStr = typeof doc.slug === "string" ? doc.slug : String(doc.slug);
	const last = slugStr.split("/").pop();
	return last ? capitalize(last) : slugStr;
};

const isBadgeVariant = (
	v: unknown,
): v is NonNullable<SidebarItem["badgeVariant"]> =>
	v === "default" || v === "success" || v === "warning" || v === "danger";
