import type { Brand } from "@create-docs/shared/types";

export type DocSlug = Brand<string, "DocSlug">;
export type DocId = Brand<string, "DocId">;
export type FilePath = Brand<string, "FilePath">;

export const DocSlug = (s: string): DocSlug => s as DocSlug;
export const DocId = (s: string): DocId => s as DocId;
export const FilePath = (s: string): FilePath => s as FilePath;

export type BadgeVariant = "default" | "success" | "warning" | "danger";

/** A single heading extracted from page body. */
export interface TocItem {
	readonly id: string;
	readonly text: string;
	readonly depth: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Per-page metadata derived from the body (not user-authored). */
export interface PageMetadata {
	readonly readingTime: number;
	readonly wordCount: number;
	readonly lastModified?: string;
	readonly editUrl?: string;
}

/** Readonly data model for a doc page's frontmatter. */
export interface Frontmatter {
	readonly title?: string;
	readonly description?: string;
	readonly order?: number;
	readonly badge?: string;
	readonly badgeVariant?: BadgeVariant;
	readonly collapsible?: boolean;
	readonly category?: string;
	readonly author?: string;
	readonly lastUpdated?: string;
	readonly tags?: readonly string[];
	readonly draft?: boolean;
	readonly [key: string]: unknown;
}

/** Parsed, normalized body of a markdown file (frontmatter stripped). */
export interface ParsedContent {
	readonly frontmatter: Frontmatter;
	readonly content: string;
	readonly rawContent: string;
}

/** A single doc page, ready for downstream consumption. */
export interface DocPage {
	readonly id: DocId;
	readonly slug: DocSlug;
	readonly title: string;
	readonly description?: string;
	readonly frontmatter: Frontmatter;
	readonly content: string;
	readonly rawContent: string;
	readonly filePath: FilePath;
	readonly group?: string;
	readonly order: number;
	readonly toc: readonly TocItem[];
	readonly metadata: PageMetadata;
}

/** Lightweight descriptor for a file discovered during scanning. */
export interface DocFile {
	readonly id: DocId;
	readonly slug: DocSlug;
	readonly frontmatter: Frontmatter;
	readonly rawContent: string;
	readonly filePath: FilePath;
	readonly group?: string;
	readonly order: number;
}
