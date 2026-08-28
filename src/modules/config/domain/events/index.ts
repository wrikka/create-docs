/**
 * Config module domain events.
 */
import type { DocsConfig, ResolvedDocsConfig } from "../../types";

export type ConfigEvent =
	| {
			readonly type: "config.loaded";
			readonly source: "defaults" | "file" | "user";
	  }
	| { readonly type: "config.merged"; readonly keys: readonly string[] }
	| { readonly type: "config.resolved"; readonly config: ResolvedDocsConfig }
	| {
			readonly type: "config.validated";
			readonly valid: boolean;
			readonly issues: number;
	  }
	| {
			readonly type: "config.changed";
			readonly previous: DocsConfig;
			readonly next: DocsConfig;
	  };

export const configLoaded = (
	source: "defaults" | "file" | "user",
): ConfigEvent => ({ type: "config.loaded", source });
export const configMerged = (keys: readonly string[]): ConfigEvent => ({
	type: "config.merged",
	keys,
});
export const configResolved = (config: ResolvedDocsConfig): ConfigEvent => ({
	type: "config.resolved",
	config,
});
export const configValidated = (
	valid: boolean,
	issues: number,
): ConfigEvent => ({
	type: "config.validated",
	valid,
	issues,
});
export const configChanged = (
	previous: DocsConfig,
	next: DocsConfig,
): ConfigEvent => ({
	type: "config.changed",
	previous,
	next,
});
