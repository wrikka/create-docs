/**
 * Use case: load a single doc file by its slug and produce a DocPage.
 * Orchestrates FS read → frontmatter parse → DocPage build.
 */

import type { AppError } from "@create-docs/shared/errors";
import { fileNotFound, parseError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { toPosixPath } from "@create-docs/shared/utils/string";
import { buildDocPage } from "../../domain/operations/build-page";
import {
	isMarkdownFile,
	parseFrontmatter,
} from "../../domain/operations/parse";
import type { FileReader } from "../../ports";
import type { DocPage } from "../../types";
import { FilePath } from "../../types";
import type { ParseCache } from "../cache";

export interface LoadDocPageDeps {
	readonly reader: FileReader;
	readonly docsDir: string;
	readonly slug: string;
	/** Optional edit-link config; if absent, no editUrl is attached. */
	readonly editLink?: {
		readonly enabled?: boolean;
		readonly baseUrl?: string;
		readonly branch?: string;
	};
	/** Optional mtime+size keyed cache. When provided, unchanged files are reused. */
	readonly cache?: ParseCache<DocPage>;
}

export const loadDocPage = async (
	deps: LoadDocPageDeps,
): Promise<Result<DocPage, AppError>> => {
	const { reader, docsDir, slug, editLink, cache } = deps;
	const filePath = `${toPosixPath(docsDir).replace(/\/$/, "")}/${slug}.md`;
	const fp = FilePath(filePath);
	const exists = await reader.exists(fp);
	if (!exists) {
		const mdocPath = FilePath(
			`${toPosixPath(docsDir).replace(/\/$/, "")}/${slug}.mdoc`,
		);
		const mdocExists = await reader.exists(mdocPath);
		if (!mdocExists) return err(fileNotFound(filePath));
		return readAndBuild(reader, mdocPath, slug, editLink, cache);
	}
	return readAndBuild(reader, fp, slug, editLink, cache);
};

const readAndBuild = async (
	reader: FileReader,
	filePath: FilePath,
	slug: string,
	editLink: LoadDocPageDeps["editLink"],
	cache: ParseCache<DocPage> | undefined,
): Promise<Result<DocPage, AppError>> => {
	const statResult = await reader.stat(filePath);
	if (statResult.ok && cache) {
		const key = `${filePath}@${statResult.value.mtimeMs.toFixed(0)}:${statResult.value.size}`;
		const hit = cache.get(key);
		if (hit) return ok(hit);
	}
	const readResult = await reader.read(filePath);
	if (!readResult.ok) return readResult;
	const raw = readResult.value;
	const fileName = filePath.split(/[/\\]/).pop() ?? "";
	if (!isMarkdownFile(fileName)) {
		return err(parseError(filePath, "Not a markdown file"));
	}
	const parsed = parseFrontmatter(raw);
	const lastModifiedMs = statResult.ok ? statResult.value.mtimeMs : undefined;
	const editUrl = computeEditUrl(String(filePath), editLink);
	const page = buildDocPage({
		slug,
		filePath,
		parsed,
		...(lastModifiedMs !== undefined ? { lastModifiedMs } : {}),
		...(editUrl !== undefined ? { editUrl } : {}),
	});
	if (statResult.ok && cache) {
		const key = `${filePath}@${statResult.value.mtimeMs.toFixed(0)}:${statResult.value.size}`;
		cache.set(key, page);
	}
	return ok(page);
};

const computeEditUrl = (
	filePath: string,
	editLink: LoadDocPageDeps["editLink"],
): string | undefined => {
	if (!editLink || editLink.enabled === false) return undefined;
	const base = editLink.baseUrl ?? "";
	if (base.length === 0) return undefined;
	const branch = editLink.branch ?? "main";
	const posix = filePath.replace(/\\/g, "/");
	const trimmed = posix.replace(/^\/+/, "");
	const tail = trimmed.startsWith("docs/") ? trimmed.slice(5) : trimmed;
	return `${base.replace(/\/$/, "")}/edit/${branch}/${tail}`;
};

/** Load a doc page from raw content directly (test-friendly, no FS). */
export const buildDocPageFromRaw = (
	slug: string,
	filePath: string,
	raw: string,
): Result<DocPage, AppError> => {
	const parsed = parseFrontmatter(raw);
	return ok(buildDocPage({ slug, filePath, parsed }));
};
