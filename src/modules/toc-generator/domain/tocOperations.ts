/**
 * TOC Operations
 *
 * Pure functions for table of contents generation
 */

import type { Heading, TocItem, TocOptions } from "../types";

/**
 * Parse headings from markdown content
 */
export const parseHeadings = (content: string): Heading[] => {
	const headings: Heading[] = [];
	const lines = content.split("\n");

	for (const line of lines) {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (match) {
			headings.push({
				text: match[2].trim(),
				level: match[1].length,
				line: lines.indexOf(line) + 1,
			});
		}
	}

	return headings;
};

/**
 * Generate slug from text
 */
export const generateSlug = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
};

/**
 * Build TOC tree from headings
 */
export const buildTocTree = (
	headings: Heading[],
	options: TocOptions = {},
): TocItem[] => {
	const { maxDepth = 6, minDepth = 1, include = [], exclude = [] } = options;

	const filteredHeadings = headings.filter((heading) => {
		if (heading.level < minDepth || heading.level > maxDepth) return false;
		if (include.length > 0 && !include.includes(heading.text)) return false;
		if (exclude.length > 0 && exclude.includes(heading.text)) return false;
		return true;
	});

	const root: TocItem[] = [];
	const stack: { item: TocItem; level: number }[] = [];

	for (const heading of filteredHeadings) {
		const item: TocItem = {
			text: heading.text,
			level: heading.level,
			id: generateSlug(heading.text),
		};

		// Pop stack until we find the parent
		while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
			stack.pop();
		}

		if (stack.length === 0) {
			root.push(item);
		} else {
			const parent = stack[stack.length - 1].item;
			if (!parent.children) parent.children = [];
			parent.children.push(item);
		}

		stack.push({ item, level: heading.level });
	}

	return root;
};

/**
 * Flatten TOC tree to list
 */
export const flattenToc = (toc: TocItem[]): TocItem[] => {
	const result: TocItem[] = [];

	const traverse = (items: TocItem[]) => {
		for (const item of items) {
			result.push(item);
			if (item.children) {
				traverse(item.children);
			}
		}
	};

	traverse(toc);
	return result;
};
