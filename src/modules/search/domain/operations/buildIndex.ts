/**
 * Pure operations for building and querying a search index.
 */

import type { DocPage } from "@create-docs/modules/content";
import { SEARCH_CONTENT_LIMIT } from "@create-docs/shared/constants";
import { truncate } from "@create-docs/shared/utils/string";
import type { SearchEntry, SearchIndex } from "../../types";

export const pageToSearchEntry = (page: DocPage): SearchEntry => {
	const text = plainText(page.content);
	const terms = tokenize(`${page.title} ${page.description ?? ""} ${text}`);
	return {
		id: String(page.id),
		slug: String(page.slug),
		title: page.title,
		description: page.description ?? "",
		content: truncate(text, SEARCH_CONTENT_LIMIT, ""),
		terms,
	};
};

export const buildSearchIndex = (pages: readonly DocPage[]): SearchIndex => {
	const entries = pages.map(pageToSearchEntry);
	const inverted: Record<string, string[]> = {};
	let totalLength = 0;
	for (const e of entries) {
		const seen = new Set<string>();
		for (const term of e.terms) {
			if (seen.has(term)) continue;
			seen.add(term);
			const list = inverted[term] ?? [];
			list.push(e.id);
			inverted[term] = list;
		}
		totalLength += e.terms.length;
	}
	return {
		entries,
		inverted,
		avgDocLength: entries.length === 0 ? 0 : totalLength / entries.length,
	};
};

/** Strip markdown formatting for full-text search. */
export const plainText = (md: string): string =>
	md
		.replace(/```[\s\S]*?```/g, " ") // fenced code
		.replace(/~~~[\s\S]*?~~~/g, " ") // tilde code
		.replace(/`[^`\n]*`/g, " ") // inline code
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links
		.replace(/^#{1,6}\s+/gm, "") // headings
		.replace(/^\s*[-*+]\s+/gm, "") // bullets
		.replace(/^\s*\d+\.\s+/gm, "") // ordered list
		.replace(/^>\s?/gm, "") // blockquote
		.replace(/[*_~]+/g, "") // emphasis
		.replace(/\s+/g, " ")
		.trim();

/** Tokenize a string into lowercase terms (length >= 2), stripping diacritics. */
export const tokenize = (s: string): string[] => {
	if (s.length === 0) return [];
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.split(/[^\p{Letter}\p{Number}]+/u)
		.filter((t) => t.length >= 2);
};
