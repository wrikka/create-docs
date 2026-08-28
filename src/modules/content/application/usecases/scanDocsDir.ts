/**
 * Use case: scan a docs directory and produce a list of DocFile descriptors.
 *
 * This is the orchestration glue between the FS adapter and the pure domain
 * operations. It does no I/O itself — it only sequences calls through ports.
 */

import type { AppError } from "@create-docs/shared/errors";
import { fileNotFound } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { toPosixPath } from "@create-docs/shared/utils/string";
import {
	extractGroup,
	isMarkdownFile,
	slugToId,
	stripMarkdownExt,
} from "../../domain/operations/parse";
import type { DirectoryScanner, FileReader } from "../../ports";
import type { DocFile } from "../../types";
import { DocId, DocSlug, FilePath } from "../../types";

export interface ScanDocsDirDeps {
	readonly scanner: DirectoryScanner;
	readonly reader: FileReader;
	readonly docsDir: string;
}

export const scanDocsDir = async (
	deps: ScanDocsDirDeps,
): Promise<Result<readonly DocFile[], AppError>> => {
	const { scanner, reader, docsDir } = deps;
	const rootExists = await reader.exists(FilePath(docsDir));
	if (!rootExists) return err(fileNotFound(docsDir));

	const files = await collectFiles(scanner, docsDir);
	const docs: DocFile[] = [];
	for (const filePath of files) {
		const readResult = await reader.read(FilePath(filePath));
		if (!readResult.ok) continue; // skip unreadable files; an event can be raised elsewhere
		const raw = readResult.value;

		// Only parse .md/.mdoc files; the extension check is also a safety guard.
		const fileName = filePath.split(/[/\\]/).pop() ?? "";
		if (!isMarkdownFile(fileName)) continue;

		const relPath = toPosixPath(filePath)
			.slice(toPosixPath(docsDir).length)
			.replace(/^\//, "");
		const slug = stripMarkdownExt(relPath);
		const id = DocId(slugToId(slug));
		const group = extractGroup(slug);

		// Lazy frontmatter extract — only the order field is needed at scan time.
		// Full parse happens in the loadContent use case.
		const order = extractQuickOrder(raw);

		docs.push({
			id,
			slug: DocSlug(slug),
			frontmatter: {},
			rawContent: raw,
			filePath: FilePath(filePath),
			...(group !== undefined ? { group } : {}),
			order,
		});
	}
	docs.sort((a, b) => a.order - b.order);
	return ok(docs);
};

const extractQuickOrder = (raw: string): number => {
	const lines = raw.split("\n");
	if (lines[0]?.trim() !== "---") return Number.MAX_SAFE_INTEGER;
	let end = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i]?.trim() === "---") {
			end = i;
			break;
		}
	}
	if (end === -1) return Number.MAX_SAFE_INTEGER;
	for (let i = 1; i < end; i++) {
		const line = lines[i] ?? "";
		const m = line.match(/^order:\s*(\d+)/);
		if (m?.[1]) return Number.parseInt(m[1], 10);
	}
	return Number.MAX_SAFE_INTEGER;
};

const collectFiles = async (
	scanner: DirectoryScanner,
	dir: string,
): Promise<string[]> => {
	const result = await scanner.list(dir);
	if (!result.ok) return [];
	const out: string[] = [];
	for (const entry of result.value) {
		if (entry.isDirectory) {
			out.push(...(await collectFiles(scanner, entry.path)));
		} else if (isMarkdownFile(entry.name)) {
			out.push(entry.path);
		}
	}
	return out;
};
