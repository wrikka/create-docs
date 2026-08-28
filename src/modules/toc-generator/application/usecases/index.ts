/**
 * TOC Generator Use Cases
 *
 * Orchestration layer for TOC generation
 */

import { buildTocTree, flattenToc, parseHeadings } from "../../domain";
import type { TocItem, TocOptions } from "../../types";

/**
 * Generate TOC from markdown content
 */
export const generateToc = (
	content: string,
	options: TocOptions = {},
): TocItem[] => {
	const headings = parseHeadings(content);
	return buildTocTree(headings, options);
};

/**
 * Generate flat TOC from markdown content
 */
export const generateFlatToc = (
	content: string,
	options: TocOptions = {},
): TocItem[] => {
	const toc = generateToc(content, options);
	return flattenToc(toc);
};
