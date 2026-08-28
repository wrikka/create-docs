/**
 * Pure operations for normalizing a parsed content into a DocPage model.
 * No I/O, no exceptions.
 */

import type { DocPage, Frontmatter, ParsedContent } from "../../types";
import { DocId, DocSlug, FilePath } from "../../types";
import {
	countWords,
	estimateReadingTime,
	extractDescription,
	extractGroup,
	extractOrder,
	extractTitle,
	extractToc,
	plainText,
	slugToId,
} from "./parse";

export interface BuildDocPageInput {
	readonly slug: string;
	readonly filePath: string;
	readonly parsed: ParsedContent;
	/** Optional mtime (ms since epoch) from the underlying FS. */
	readonly lastModifiedMs?: number;
	/** Optional per-page edit URL (resolved from config.editLink). */
	readonly editUrl?: string;
}

export const buildDocPage = ({
	slug,
	filePath,
	parsed,
	lastModifiedMs,
	editUrl,
}: BuildDocPageInput): DocPage => {
	const { frontmatter, content, rawContent } = parsed;
	const id = DocId(slugToId(slug));
	const group = extractGroup(slug);
	const text = plainText(content);
	const wordCount = countWords(text);
	const readingTime = estimateReadingTime(wordCount);
	const toc = extractToc(content);
	const metadata: DocPage["metadata"] = {
		readingTime,
		wordCount,
		...(lastModifiedMs !== undefined
			? { lastModified: new Date(lastModifiedMs).toISOString() }
			: {}),
		...(editUrl !== undefined ? { editUrl } : {}),
	};
	return {
		id,
		slug: DocSlug(slug),
		title: extractTitle(frontmatter, slug),
		...maybeDescription(frontmatter),
		frontmatter,
		content,
		rawContent,
		filePath: FilePath(filePath),
		...(group !== undefined ? { group } : {}),
		order: extractOrder(frontmatter),
		toc,
		metadata,
	};
};

const maybeDescription = (
	f: Frontmatter,
): { description: string } | Record<string, never> => {
	const d = extractDescription(f);
	return d !== undefined ? { description: d } : {};
};

/** Compute an edit URL for a file path from the edit-link config. */
export const buildEditUrl = (
	filePath: string,
	editLink:
		| { enabled?: boolean; baseUrl?: string; branch?: string }
		| undefined,
): string | undefined => {
	if (!editLink || editLink.enabled === false) return undefined;
	const base = editLink.baseUrl ?? "";
	if (base.length === 0) return undefined;
	const branch = editLink.branch ?? "main";
	const posix = filePath.replace(/\\/g, "/");
	const trimmed = posix.replace(/^\/+/, "");
	const tail = trimmed.startsWith("docs/") ? trimmed.slice(5) : trimmed;
	return `${stripTrailingSlash(base)}/edit/${branch}/${tail}`;
};

const stripTrailingSlash = (s: string): string =>
	s.endsWith("/") ? s.slice(0, -1) : s;
