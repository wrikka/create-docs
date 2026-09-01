/**
 * Markdown TOC adapter implementation.
 * Provides TOC generation from markdown content using native string parsing.
 */

import { parseError, pluginError } from "@create-docs/shared/errors";
import {
	buildHierarchicalToc,
	generateTocId,
} from "../domain/operations/toc-operations";
import type { TocPort } from "../ports/toc-port";
import type { TocConfig, TocItemEnhanced } from "../types/toc";

const defaultTocConfig: TocConfig = {
	enabled: true,
	maxDepth: 6,
	minHeadingLevel: 1,
	includeSubheadings: true,
};

const resolveTocConfig = (config: unknown): TocConfig => {
	const cfg = config as Partial<TocConfig> | undefined;
	if (!cfg) return defaultTocConfig;
	return {
		enabled: cfg.enabled ?? defaultTocConfig.enabled,
		maxDepth: cfg.maxDepth ?? defaultTocConfig.maxDepth,
		minHeadingLevel: cfg.minHeadingLevel ?? defaultTocConfig.minHeadingLevel,
		includeSubheadings:
			cfg.includeSubheadings ?? defaultTocConfig.includeSubheadings,
	};
};

const stripMarkdownLinks = (text: string): string =>
	text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

const extractHeadingsFromMarkdown = (
	content: string,
	config: TocConfig,
): readonly TocItemEnhanced[] => {
	const headings: TocItemEnhanced[] = [];
	let inCodeBlock = false;

	for (const raw of content.split(/\r?\n/)) {
		const line = raw.trim();

		if (line.startsWith("```")) {
			inCodeBlock = !inCodeBlock;
			continue;
		}

		if (inCodeBlock) continue;

		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (!match) continue;

		const level = match[1].length;
		if (level < config.minHeadingLevel || level > config.maxDepth) continue;

		const text = stripMarkdownLinks(match[2].trim());
		headings.push({
			id: generateTocId(text),
			text,
			level,
		});
	}

	return headings;
};

const isTocItem = (value: unknown): value is TocItemEnhanced =>
	value !== null &&
	typeof value === "object" &&
	"id" in value &&
	"text" in value &&
	"level" in value;

export const createMarkdownTocAdapter = (): TocPort => ({
	extractHeadings: async (content: string, config?: unknown) => {
		try {
			const cfg = resolveTocConfig(config);
			return extractHeadingsFromMarkdown(content, cfg);
		} catch (error) {
			throw parseError("<input>", "Failed to extract headings", error);
		}
	},

	generateToc: async (headings: readonly unknown[], config?: unknown) => {
		try {
			const cfg = resolveTocConfig(config);
			const typedHeadings = headings.filter(isTocItem);
			const result = buildHierarchicalToc(typedHeadings, cfg);

			if (!result.ok) {
				throw pluginError("Failed to build hierarchical TOC", {
					context: { error: String(result.error) },
				});
			}

			return result.value;
		} catch (error) {
			throw pluginError("Failed to generate TOC", {
				context: { config, error: String(error) },
			});
		}
	},
});
