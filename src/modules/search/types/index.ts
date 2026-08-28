import type { Brand } from "@create-docs/shared/types";

export type SearchDocId = Brand<string, "SearchDocId">;
export const SearchDocId = (s: string): SearchDocId => s as SearchDocId;

export interface SearchEntry {
	readonly id: string;
	readonly slug: string;
	readonly title: string;
	readonly description: string;
	readonly content: string;
	/** Pre-tokenized content terms (lowercase, length >= 2). */
	readonly terms: readonly string[];
}

export interface SearchIndex {
	readonly entries: readonly SearchEntry[];
	/** Token → entry ids that contain it (BM25-ready). */
	readonly inverted: Readonly<Record<string, readonly string[]>>;
	/** Average document length across the corpus (used by BM25). */
	readonly avgDocLength: number;
}
