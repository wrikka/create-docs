/**
 * File-system-backed DocsLoader — composes the FS adapter with the
 * processDocsWorkflow use case from the content module.
 */

import * as path from "node:path";
import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import type { DocPage } from "@create-docs/modules/content";
import { processDocsWorkflow } from "@create-docs/modules/content";
import type { DocsLoader } from "@create-docs/modules/plugin";
import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import { nodeDirectoryScanner, nodeFileReader } from "../fs";

export const createFsDocsLoader = (): DocsLoader => ({
	async loadAll(
		config: ResolvedDocsConfig,
	): Promise<Result<readonly DocPage[], AppError>> {
		const reader = nodeFileReader;
		const scanner = nodeDirectoryScanner;
		const docsDir = path.isAbsolute(config.docsDir)
			? config.docsDir
			: path.resolve(process.cwd(), config.docsDir);
		return processDocsWorkflow({
			scanner,
			reader,
			docsDir,
			editLink: config.editLink,
		});
	},
});
