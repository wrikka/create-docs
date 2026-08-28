/**
 * Workflow: process all docs in a directory into fully-built DocPages.
 * Used by the Vite plugin's `load(id)` virtual modules.
 */

import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import type { DirectoryScanner, FileReader } from "../../ports";
import type { DocPage } from "../../types";
import type { ParseCache } from "../cache";
import { loadDocPage } from "../usecases/loadDocPage";
import { scanDocsDir } from "../usecases/scanDocsDir";

export interface ProcessDocsWorkflowDeps {
	readonly scanner: DirectoryScanner;
	readonly reader: FileReader;
	readonly docsDir: string;
	/** Optional edit-link config; threaded into per-page editUrl computation. */
	readonly editLink?: {
		readonly enabled?: boolean;
		readonly baseUrl?: string;
		readonly branch?: string;
	};
	/** Optional mtime+size cache, shared across reloads. */
	readonly cache?: ParseCache<DocPage>;
}

export const processDocsWorkflow = async (
	deps: ProcessDocsWorkflowDeps,
): Promise<Result<readonly DocPage[], AppError>> => {
	const scanned = await scanDocsDir({
		scanner: deps.scanner,
		reader: deps.reader,
		docsDir: deps.docsDir,
	});
	if (!scanned.ok) return scanned;

	const pages: DocPage[] = [];
	for (const file of scanned.value) {
		const slug = typeof file.slug === "string" ? file.slug : String(file.slug);
		const pageResult = await loadDocPage({
			reader: deps.reader,
			docsDir: deps.docsDir,
			slug,
			...(deps.editLink !== undefined ? { editLink: deps.editLink } : {}),
			...(deps.cache !== undefined ? { cache: deps.cache } : {}),
		});
		if (pageResult.ok) pages.push(pageResult.value);
	}
	return ok(pages);
};
