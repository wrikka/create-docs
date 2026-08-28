/**
 * Node FS-backed config loader.
 * Tries to dynamically import `${cwd}/${configPath}` and returns its default export.
 * Returns `null` if the file doesn't exist (caller falls back to defaults).
 */

import * as path from "node:path";
import type { ConfigLoader, DocsConfig } from "@create-docs/modules/config";
import { FilePath } from "@create-docs/modules/content/types";
import type { AppError } from "@create-docs/shared/errors";
import { parseError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { nodeFileReader } from "../fs";

export const createNodeConfigLoader = (): ConfigLoader => ({
	async load(
		cwd: string,
		configPath: string,
	): Promise<Result<Partial<DocsConfig> | null, AppError>> {
		const fullPath = path.isAbsolute(configPath)
			? configPath
			: path.join(cwd, configPath);
		const fp = FilePath(fullPath);
		const exists = await nodeFileReader.exists(fp);
		if (!exists) return ok(null);

		try {
			// Dynamic import — works in ESM context. CJS/TS configs require the bundler to transform.
			const url = new URL(`file:///${fullPath.replace(/\\/g, "/")}`).href;
			const mod: { default?: Partial<DocsConfig> } = await import(url);
			return ok(mod.default ?? {});
		} catch (e) {
			return err(parseError(fullPath, "Failed to load config", e));
		}
	},
});
