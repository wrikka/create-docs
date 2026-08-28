/**
 * Use case: load user config from a project file and merge with defaults.
 * Pure orchestration — no I/O itself, delegates to ConfigLoader.
 */

import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import {
	resolveConfig,
	type UserConfig,
} from "../../domain/operations/resolve";
import type { ConfigLoader } from "../../ports";
import type { ResolvedDocsConfig } from "../../types";

export interface LoadConfigDeps {
	readonly loader: ConfigLoader;
	readonly cwd: string;
	readonly configPath: string;
	readonly userOverride?: UserConfig;
}

export const loadConfig = async (
	deps: LoadConfigDeps,
): Promise<Result<ResolvedDocsConfig, AppError>> => {
	const { loader, cwd, configPath, userOverride } = deps;

	if (userOverride) {
		return ok(resolveConfig(userOverride));
	}

	const result = await loader.load(cwd, configPath);
	if (!result.ok) return result;
	const fileConfig = result.value;
	if (fileConfig === null) {
		return ok(resolveConfig({}));
	}
	return ok(resolveConfig(fileConfig));
};
