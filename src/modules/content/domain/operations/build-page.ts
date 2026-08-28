/**
 * Pure domain operation for constructing a DocPage from parsed markdown.
 */

import { toPosixPath } from "@create-docs/shared/utils/string";
import type { DocPage, Frontmatter, ParsedContent, TocItem } from "../../types";
import { DocId, DocSlug, FilePath } from "../../types";

export interface BuildDocPageInput {
	slug: string;
	filePath: string;
	parsed: ParsedContent;
	lastModifiedMs?: number;
	editUrl?: string;
}

export interface EditLinkConfig {
	readonly enabled?: boolean;
	readonly baseUrl?: string;
	readonly branch?: string;
}

const parseToc = (content: string): readonly TocItem[] => {
	const headings: TocItem[] = [];
	const seen = new Set<string>();
	for (const line of content.split(/\r?\n/)) {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (!match) continue;
		const depth = match[1].length as TocItem["depth"];
		const rawText = match[2].trim();
		// Strip markdown links, emphasis, and inline code markers.
		const text = rawText
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/[*_`]/g, "");
		let id = text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-+|-+$/g, "");
		if (!id) id = `heading-${headings.length}`;
		if (seen.has(id)) {
			let suffix = 1;
			let candidate = `${id}-${suffix}`;
			while (seen.has(candidate)) {
				suffix++;
				candidate = `${id}-${suffix}`;
			}
			id = candidate;
		}
		seen.add(id);
		headings.push({ id, text, depth });
	}
	return headings;
};

const deriveTitle = (
	frontmatter: Frontmatter,
	filePath: string,
	slug: string,
): string => {
	if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
		return frontmatter.title.trim();
	}
	const name = filePath.split(/[/\\]/).pop() ?? slug;
	const withoutExt = name.replace(/\.mdx?$/i, "");
	const last = withoutExt.replace(/[-_]/g, " ").split(" ").pop() ?? withoutExt;
	return last.charAt(0).toUpperCase() + last.slice(1);
};

const deriveGroup = (
	frontmatter: Frontmatter,
	slug: string,
): string | undefined => {
	if (typeof frontmatter.category === "string" && frontmatter.category.trim()) {
		return frontmatter.category.trim();
	}
	const firstSegment = slug.split("/")[0];
	if (firstSegment && firstSegment !== slug) {
		return firstSegment;
	}
	return undefined;
};

const computeMetadata = (
	content: string,
	lastModifiedMs: number | undefined,
	editUrl: string | undefined,
): DocPage["metadata"] => {
	const words = content
		.replace(/[#*_`[\](){}|]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 0).length;
	const readingTime = Math.max(1, Math.round(words / 200));
	const metadata: DocPage["metadata"] = {
		readingTime,
		wordCount: words,
		...(lastModifiedMs !== undefined
			? { lastModified: new Date(lastModifiedMs).toISOString() }
			: {}),
		...(editUrl !== undefined ? { editUrl } : {}),
	};
	return metadata;
};

export const buildEditUrl = (
	filePath: string,
	editLink: EditLinkConfig,
): string | undefined => {
	if (editLink.enabled === false) return undefined;
	const base = editLink.baseUrl ?? "";
	if (base.length === 0) return undefined;
	const branch = editLink.branch ?? "main";
	const posix = toPosixPath(filePath).replace(/^\/+/, "");
	const tail = posix.startsWith("docs/") ? posix.slice(5) : posix;
	return `${base.replace(/\/$/, "")}/edit/${branch}/${tail}`;
};

export const buildDocPage = (input: BuildDocPageInput): DocPage => {
	const { slug, filePath, parsed, lastModifiedMs, editUrl } = input;
	const title = deriveTitle(parsed.frontmatter, filePath, slug);
	const description =
		typeof parsed.frontmatter.description === "string"
			? parsed.frontmatter.description
			: undefined;
	const group = deriveGroup(parsed.frontmatter, slug);
	const order =
		typeof parsed.frontmatter.order === "number" ? parsed.frontmatter.order : 0;
	const toc = parseToc(parsed.content);
	const id = slug.replace(/\//g, "-");

	return {
		id: DocId(id),
		slug: DocSlug(slug),
		title,
		description,
		frontmatter: parsed.frontmatter,
		content: parsed.content,
		rawContent: parsed.rawContent,
		filePath: FilePath(filePath),
		group,
		order,
		toc,
		metadata: computeMetadata(parsed.content, lastModifiedMs, editUrl),
	};
};
