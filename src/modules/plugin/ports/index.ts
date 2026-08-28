/**
 * Plugin module ports — interfaces for I/O the plugin needs from adapters.
 */

import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import type { DocPage } from "@create-docs/modules/content";
import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";

export interface DocsLoader {
	loadAll(
		config: ResolvedDocsConfig,
	): Promise<Result<readonly DocPage[], AppError>>;
}

export interface DocsWatcher {
	watch(
		docsDir: string,
		onChange: (filePath: string) => void,
	): { close: () => void };
}
