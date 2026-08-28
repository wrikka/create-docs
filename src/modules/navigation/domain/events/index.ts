/**
 * Domain events for the navigation module.
 * Pure event types — no handlers.
 */
import type { SidebarGroup } from "../../types";

export type NavigationEvent =
	| { readonly type: "nav.generated"; readonly groupsCount: number }
	| {
			readonly type: "nav.rebuilt";
			readonly reason: "config_changed" | "content_changed" | "manual";
	  }
	| { readonly type: "sidebar.group_built"; readonly group: SidebarGroup };

export const navGenerated = (groupsCount: number): NavigationEvent => ({
	type: "nav.generated",
	groupsCount,
});

export const navRebuilt = (
	reason: "config_changed" | "content_changed" | "manual",
): NavigationEvent => ({
	type: "nav.rebuilt",
	reason,
});

export const sidebarGroupBuilt = (group: SidebarGroup): NavigationEvent => ({
	type: "sidebar.group_built",
	group,
});
