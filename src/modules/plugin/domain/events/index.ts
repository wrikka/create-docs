/**
 * Plugin module domain events.
 */

import type { ResolvedDocsConfig } from "@create-docs/modules/config";

export type PluginEvent =
	| { readonly type: "plugin.initialized"; readonly config: ResolvedDocsConfig }
	| {
			readonly type: "plugin.config_resolved";
			readonly docsDir: string;
			readonly baseRoute: string;
	  }
	| {
			readonly type: "plugin.virtual_module_emitted";
			readonly id: string;
			readonly bytes: number;
	  }
	| { readonly type: "plugin.file_watched"; readonly path: string }
	| { readonly type: "plugin.reloaded"; readonly pages: number }
	| {
			readonly type: "plugin.error";
			readonly phase: "init" | "scan" | "transform" | "watch";
			readonly message: string;
	  };

export const pluginInitialized = (config: ResolvedDocsConfig): PluginEvent => ({
	type: "plugin.initialized",
	config,
});
export const pluginConfigResolved = (
	docsDir: string,
	baseRoute: string,
): PluginEvent => ({
	type: "plugin.config_resolved",
	docsDir,
	baseRoute,
});
export const pluginVirtualModuleEmitted = (
	id: string,
	bytes: number,
): PluginEvent => ({
	type: "plugin.virtual_module_emitted",
	id,
	bytes,
});
export const pluginFileWatched = (path: string): PluginEvent => ({
	type: "plugin.file_watched",
	path,
});
export const pluginReloaded = (pages: number): PluginEvent => ({
	type: "plugin.reloaded",
	pages,
});
export const pluginError = (
	phase: "init" | "scan" | "transform" | "watch",
	message: string,
): PluginEvent => ({
	type: "plugin.error",
	phase,
	message,
});
