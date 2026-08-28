/**
 * Config module ports — interfaces for I/O.
 */

import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import type { DocsConfig } from "../types";

/** Loads a DocsConfig from a project file (e.g. docs/docs.config.ts). */
export interface ConfigLoader {
	load(
		cwd: string,
		configPath: string,
	): Promise<Result<Partial<DocsConfig> | null, AppError>>;
}
