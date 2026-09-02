/**
 * Imperative shell: assemble all the pieces into a Vite Plugin.
 *
 * The functional core (buildVirtualModules, etc.) lives in the plugin module.
 * This file is the I/O boundary that talks to Vite's runtime API.
 */

import {
	type DocsPluginOptions,
	type ResolvedDocsConfig,
	resolveConfig,
	type UserConfig,
} from "@create-docs/modules/config";
import { type DocPage, ParseCache } from "@create-docs/modules/content";
import { buildDocs, isMarkdownPath } from "@create-docs/modules/plugin";
import {
	DEFAULT_BASE_ROUTE,
	DEFAULT_DOCS_DIR,
	PLUGIN_NAME,
	VIRTUAL_PREFIX,
} from "@create-docs/shared/constants";
import { isString } from "@create-docs/shared/utils/object";
import { toPosixPath } from "@create-docs/shared/utils/string";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { createFsDocsLoader } from "../../adapters/fs/fs-docs-loader";
import { buildVelite } from "../../adapters/velite";
import {
	createNodeDocsWatcher,
	createPollingWatcher,
} from "../../adapters/vite";

export type WatchMode = "native" | "polling";

export interface DocsPluginConfig extends Partial<UserConfig> {
	/** Optional: explicit config object passed by the consumer. */
	readonly userConfig?: UserConfig;
	/** Optional: pre-resolved plugin options override. */
	readonly options?: DocsPluginOptions;
	/** Force a full browser reload on HMR (default: false, granular invalidation). */
	readonly fullReload?: boolean;
	/** Watcher mode. Default: 'native'. Use 'polling' for Linux subdir reliability. */
	readonly watchMode?: WatchMode;
	/** Polling interval in ms when watchMode='polling'. Default: 300. */
	readonly pollingIntervalMs?: number;
	/** Per-page transformation hook. Invoked after parse, before serialisation. */
	readonly transformPage?: (page: DocPage) => DocPage | Promise<DocPage>;
}

export const docsPlugin = (cfg: DocsPluginConfig = {}): Plugin => {
	const userConfig: UserConfig = cfg.userConfig ?? { ...cfg };
	const options: DocsPluginOptions = cfg.options ?? {};
	const fullReload = cfg.fullReload === true;
	const watchMode: WatchMode = cfg.watchMode ?? "native";
	const pollingIntervalMs = cfg.pollingIntervalMs ?? 300;
	const transformPage = cfg.transformPage;

	const docsDir = options.docsDir ?? DEFAULT_DOCS_DIR;
	const baseRoute = options.baseRoute ?? DEFAULT_BASE_ROUTE;

	let resolved: ResolvedDocsConfig | null = null;
	let server: ViteDevServer | null = null;
	let watcherHandle: { close: () => void } | null = null;
	let lastModules: Readonly<Record<string, string>> = {};
	const cache: ParseCache<DocPage> = new ParseCache<DocPage>();

	const resolve = (): ResolvedDocsConfig => {
		if (resolved) return resolved;
		resolved = resolveConfig({ ...userConfig, docsDir, baseRoute });
		return resolved;
	};

	const invalidateAndNotify = (now2: number = Date.now()): void => {
		if (!server) return;
		const invalidated: string[] = [];
		for (const id of Object.keys(lastModules)) {
			const mod = server.moduleGraph.getModuleById(id);
			if (mod) {
				server.moduleGraph.invalidateModule(mod);
				invalidated.push(id);
			}
		}
		if (fullReload) {
			server.ws.send({ type: "full-reload" });
			return;
		}
		// Granular HMR: send an update event referencing the virtual modules.
		// Connected clients with `import.meta.hot.accept` on these virtuals
		// will hot-swap; others will be re-evaluated via the standard
		// module graph invalidation without a full page reload.
		const now = now2;
		server.ws.send({
			type: "update",
			updates: invalidated.map((id) => ({
				type: "js-update" as const,
				path: id,
				acceptedPath: id,
				timestamp: now,
			})),
		});
	};

	const reload = async (): Promise<void> => {
		const config = resolve();

		// Build content with Velite
		const veliteResult = await buildVelite({
			configPath: config.docsDir
				? `${config.docsDir}/velite.config.ts`
				: "velite.config.ts",
			watch: true,
		});

		if (!veliteResult.success) {
			console.error(
				`[${PLUGIN_NAME}] Velite build failed:`,
				veliteResult.error,
			);
			return;
		}

		// Build virtual modules from Velite output
		const loader = createFsDocsLoader();
		const result = await buildDocs({
			config,
			loader,
			...(transformPage ? { transformPage } : {}),
		});

		if (result.ok) {
			lastModules = result.value as unknown as Record<string, string>;
			invalidateAndNotify();
		}
	};

	return {
		name: PLUGIN_NAME,

		config() {
			return {
				optimizeDeps: {
					include: ["comark", "@comark/svelte"],
				},
			};
		},

		async configResolved(config: ResolvedConfig) {
			resolve();
			// Initial build so the virtual modules are ready for the first request.
			await reload();
			// Watch docsDir for changes
			try {
				const docsDirAbs = toPosixPath(config.root).replace(/\/$/, "");
				if (watchMode === "polling") {
					const watcher = createPollingWatcher({
						intervalMs: pollingIntervalMs,
					});
					watcherHandle = watcher.watch(docsDirAbs, (_filename) => {
						void reload();
					});
				} else {
					const watcher = createNodeDocsWatcher();
					watcherHandle = watcher.watch(docsDirAbs, (_filename) => {
						void reload();
					});
				}
			} catch (e) {
				console.warn(`[${PLUGIN_NAME}] Failed to start watcher:`, e);
			}
		},

		configureServer(s: ViteDevServer) {
			server = s;
			s.httpServer?.on("close", () => {
				watcherHandle?.close();
				cache.clear();
			});
		},

		resolveId(id: string) {
			if (id.startsWith(VIRTUAL_PREFIX)) return id;
			return null;
		},

		async load(id: string) {
			if (!id.startsWith(VIRTUAL_PREFIX)) return null;
			const mod = (lastModules as Record<string, string>)[id];
			if (mod !== undefined) return mod;
			await reload();
			const m = (lastModules as Record<string, string>)[id];
			return m ?? null;
		},

		async transform(code: string, id: string) {
			if (!isMarkdownPath(id)) return null;
			if (!isString(code)) return null;
			try {
				// Velite handles markdown parsing, skip transformation here
				// Content is processed by Velite build and loaded from virtual modules
				return null;
			} catch (e) {
				console.error(`[${PLUGIN_NAME}] Failed to transform ${id}:`, e);
				return { code, map: null };
			}
		},

		closeBundle() {
			watcherHandle?.close();
		},
	};
};

export default docsPlugin;
