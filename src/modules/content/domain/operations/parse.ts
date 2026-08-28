/**
 * Pure frontmatter parser.
 * No I/O. No exceptions thrown. Returns ParsedContent.
 *
 * Supports:
 *   - Full YAML 1.2 via js-yaml adapter (nested objects, dates, anchors)
 *   - Fallback to mini-parser for simple cases
 *   - Scalar values: string, number, boolean, null
 *   - Inline arrays: [a, b, c]
 *   - List arrays:
 *       tags:
 *         - a
 *         - b
 *   - Quoted strings ("value" or 'value')
 */
import {
	FRONTMATTER_DELIMITER,
	SIDEBAR_DEFAULT_ORDER,
} from "@create-docs/shared/constants";
import { isString } from "@create-docs/shared/utils/object";
import {
	isBlank,
	splitLines,
	stripQuotes,
	stripSuffix,
} from "@create-docs/shared/utils/string";
import { parseYaml } from "../../../yaml-parser/domain/operations/parse-yaml";
import type { Frontmatter, ParsedContent, TocItem } from "../../types";

const parseScalar = (raw: string): unknown => {
	const value = stripQuotes(raw);
	if (value === "true") return true;
	if (value === "false") return false;
	if (value === "null" || value === "~") return null;
	if (value === "") return "";
	if (/^-?\d+$/.test(value)) return Number.parseInt(value, 10);
	if (/^-?\d*\.\d+$/.test(value)) return Number.parseFloat(value);
	return value;
};

const parseInlineList = (raw: string): string[] => {
	const inner = raw.slice(1, -1).trim();
	if (inner.length === 0) return [];
	return inner
		.split(",")
		.map((v) => stripQuotes(v.trim()))
		.filter((v) => v.length > 0);
};

/** Parse a multi-line frontmatter block (without delimiters) into a typed object. */
export const parseFrontmatterBlock = (
	lines: readonly string[],
): Frontmatter => {
	const block = lines.join("\n");
	const yamlResult = parseYaml(block);

	if (
		yamlResult.ok &&
		typeof yamlResult.value === "object" &&
		yamlResult.value !== null
	) {
		return yamlResult.value as Frontmatter;
	}

	// Fallback to mini-parser for simple cases
	const out: Record<string, unknown> = {};
	let i = 0;
	while (i < lines.length) {
		const line = lines[i] ?? "";
		const trimmed = line.trim();
		if (trimmed.length === 0 || trimmed.startsWith("#")) {
			i++;
			continue;
		}

		const colonIdx = line.indexOf(":");
		if (colonIdx < 0) {
			i++;
			continue;
		}

		const key = line.slice(0, colonIdx).trim();
		const rest = line.slice(colonIdx + 1).trim();

		if (rest === "" || rest === "|" || rest === ">") {
			// List array starting on next line(s)
			const items: string[] = [];
			i++;
			while (i < lines.length) {
				const next = lines[i] ?? "";
				if (!next.trim().startsWith("-")) break;
				items.push(stripQuotes(next.trim().slice(1).trim()));
				i++;
			}
			if (items.length > 0) out[key] = items;
			continue;
		}

		if (rest.startsWith("[") && rest.endsWith("]")) {
			out[key] = parseInlineList(rest);
		} else {
			out[key] = parseScalar(rest);
		}
		i++;
	}
	return out as Frontmatter;
};

/** Parse a raw markdown file's contents, separating frontmatter from body. */
export const parseFrontmatter = (raw: string): ParsedContent => {
	const lines = splitLines(raw);
	if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
		return { frontmatter: {}, content: raw, rawContent: raw };
	}

	let endIdx = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i]?.trim() === FRONTMATTER_DELIMITER) {
			endIdx = i;
			break;
		}
	}

	if (endIdx === -1) {
		return { frontmatter: {}, content: raw, rawContent: raw };
	}

	const fmLines = lines.slice(1, endIdx);
	const contentLines = lines.slice(endIdx + 1);
	const frontmatter = parseFrontmatterBlock(fmLines);
	const content = contentLines.join("\n");

	return { frontmatter, content, rawContent: raw };
};

/** Extract a title from frontmatter or fall back to slug tail. */
export const extractTitle = (
	frontmatter: Frontmatter,
	slug: string,
): string => {
	if (isString(frontmatter.title) && !isBlank(frontmatter.title)) {
		return frontmatter.title;
	}
	const parts = slug.split("/");
	return parts[parts.length - 1] ?? slug;
};

/** Extract a numeric order from frontmatter; default = SIDEBAR_DEFAULT_ORDER. */
export const extractOrder = (frontmatter: Frontmatter): number => {
	const o = frontmatter.order;
	return typeof o === "number" && Number.isFinite(o)
		? o
		: SIDEBAR_DEFAULT_ORDER;
};

/** First path segment of a slug, used for grouping in sidebar. */
export const extractGroup = (slug: string): string | undefined => {
	const parts = slug.split("/");
	return parts.length > 1 ? parts[0] : undefined;
};

/** Generate a deterministic id from a slug. */
export const slugToId = (slug: string): string =>
	slug.replace(/[/\\]/g, "-").replace(/^-/, "");

/** Strip `.md` or `.mdoc` extension from a file name. */
export const stripMarkdownExt = (fileName: string): string =>
	stripSuffix(stripSuffix(fileName, ".mdoc"), ".md");

/** Determine if a file name has a supported markdown extension. */
export const isMarkdownFile = (fileName: string): boolean =>
	fileName.endsWith(".md") || fileName.endsWith(".mdoc");

/** Extract a description from frontmatter, if any. */
export const extractDescription = (
	frontmatter: Frontmatter,
): string | undefined => {
	const d = frontmatter.description;
	return isString(d) && !isBlank(d) ? d : undefined;
};

/** Strip Markdown formatting from a body so we can index plain text. */
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

/** Count words in a plain-text string. */
export const countWords = (text: string): number => {
	if (text.length === 0) return 0;
	const t = text.trim();
	if (t.length === 0) return 0;
	return t.split(/\s+/).length;
};

/** Estimate reading time in minutes from a word count (default 220 wpm). */
export const estimateReadingTime = (wordCount: number, wpm = 220): number =>
	Math.max(1, Math.ceil(wordCount / wpm));

/** Slugify a heading for an anchor id. Deduplicates across the document. */
export const slugifyHeading = (raw: string): string => {
	const base = raw
		.toLowerCase()
		.trim()
		.replace(/[`*_~]+/g, "")
		.replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	return base.length > 0 ? base : "section";
};

/** Extract a table of contents from markdown body (h1–h6). Dedupe anchor ids. */
export const extractToc = (md: string): readonly TocItem[] => {
	const lines = splitLines(md);
	const seen = new Map<string, number>();
	const items: TocItem[] = [];
	for (const line of lines) {
		const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
		if (!m) continue;
		const depth = m[1]?.length as 1 | 2 | 3 | 4 | 5 | 6;
		const text = m[2] ?? "";
		if (text.length === 0) continue;
		const base = slugifyHeading(text);
		const count = seen.get(base) ?? 0;
		seen.set(base, count + 1);
		const id = count === 0 ? base : `${base}-${count}`;
		items.push({ id, text, depth });
	}
	return items;
};
