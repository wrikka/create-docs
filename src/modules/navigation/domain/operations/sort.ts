/**
 * Pure operations for sorting/ordering nav items.
 */

import type {
	NavItem,
	NavSection,
	SidebarGroup,
	SidebarItem,
} from "../../types";
import { sortByString } from "../shared/utils/array";

export const sortNavSections = (
	sections: readonly NavSection[],
): readonly NavSection[] =>
	[...sections].sort((a, b) => a.title.localeCompare(b.title));

export const sortNavItems = (items: readonly NavItem[]): readonly NavItem[] =>
	sortByString(items, (i) => i.label);

export const sortSidebarGroups = (
	groups: readonly SidebarGroup[],
): readonly SidebarGroup[] => sortByString(groups, (g) => g.title);

export const sortSidebarItems = (
	items: readonly SidebarItem[],
): readonly SidebarItem[] => sortByString(items, (i) => i.title);
