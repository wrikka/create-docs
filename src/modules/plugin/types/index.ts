import type { Brand } from "@create-docs/shared/types";

export type VirtualModuleId = Brand<string, "VirtualModuleId">;
export const VirtualModuleId = (s: string): VirtualModuleId =>
	s as VirtualModuleId;

export const VIRTUAL_DATA: VirtualModuleId =
	VirtualModuleId("virtual:docs/data");
export const VIRTUAL_SEARCH_INDEX: VirtualModuleId = VirtualModuleId(
	"virtual:docs/search-index",
);
export const VIRTUAL_SIDEBAR: VirtualModuleId = VirtualModuleId(
	"virtual:docs/sidebar",
);
export const VIRTUAL_NAV: VirtualModuleId = VirtualModuleId("virtual:docs/nav");

export interface PluginContext {
	readonly root: string;
	readonly mode: "dev" | "build" | "test";
}

export interface PluginHooks {
	readonly configResolved?: (config: PluginContext) => void;
	readonly serverClosed?: () => void;
	readonly fileChanged?: (filePath: string) => void;
	readonly docsReloaded?: () => void;
}
