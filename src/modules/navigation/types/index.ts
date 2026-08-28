import type { Brand } from "@create-docs/shared/types";

export type NavItemHref = Brand<string, "NavItemHref">;
export const NavItemHref = (s: string): NavItemHref => s as NavItemHref;

export type BadgeVariant = "default" | "success" | "warning" | "danger";

export interface NavItem {
	readonly label: string;
	readonly href?: string;
	readonly items?: readonly NavItem[];
	readonly badge?: string;
	readonly icon?: string;
}

export interface NavSection {
	readonly title: string;
	readonly items: readonly NavItem[];
}

export interface SidebarItem {
	readonly title: string;
	readonly slug: string;
	readonly badge?: string;
	readonly badgeVariant?: BadgeVariant;
	readonly items?: readonly SidebarItem[];
}

export interface SidebarGroup {
	readonly title: string;
	readonly icon?: string;
	readonly items: readonly SidebarItem[];
	readonly collapsed?: boolean;
}

export interface Sidebar {
	readonly groups: readonly SidebarGroup[];
}
