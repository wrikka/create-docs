/**
 * Pure TOC operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { TocConfig, TocItemEnhanced } from "../../types/toc";

export type TocError = {
	readonly kind: "toc-error";
	readonly message: string;
};

/**
 * Build hierarchical TOC from flat headings.
 */
export const buildHierarchicalToc = (
	headings: readonly TocItemEnhanced[],
	config: TocConfig,
): Result<TocItemEnhanced[], TocError> => {
	try {
		const root: TocItemEnhanced[] = [];
		const stack: TocItemEnhanced[] = [];

		for (const heading of headings) {
			if (heading.level < config.minHeadingLevel) continue;
			if (heading.level > config.maxDepth) continue;

			while (stack.length > 0) {
				const top = stack[stack.length - 1];
				if (top && top.level >= heading.level) {
					stack.pop();
				} else {
					break;
				}
			}

			const item: TocItemEnhanced = { ...heading, children: [] };

			if (stack.length === 0) {
				root.push(item);
			} else {
				const parent = stack[stack.length - 1];
				if (parent?.children) {
					parent.children = [...parent.children, item];
				}
			}

			stack.push(item);
		}

		return ok(root);
	} catch (error) {
		return err({
			kind: "toc-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Generate TOC ID from heading text.
 */
export const generateTocId = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
};

/**
 * Flatten hierarchical TOC.
 */
export const flattenToc = (
	toc: readonly TocItemEnhanced[],
): readonly TocItemEnhanced[] => {
	const result: TocItemEnhanced[] = [];

	const flatten = (items: readonly TocItemEnhanced[]) => {
		for (const item of items) {
			result.push({ ...item, children: undefined });
			if (item.children) {
				flatten(item.children);
			}
		}
	};

	flatten(toc);
	return result;
};
