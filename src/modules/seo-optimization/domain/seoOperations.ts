/**
 * SEO Operations
 *
 * Pure functions for SEO optimization
 */

import type { MetaTags, SeoOptions } from "../types";

/**
 * Extract title from markdown content
 */
export const extractTitle = (content: string): string | null => {
	const titleMatch = content.match(/^#\s+(.+)$/m);
	return titleMatch?.[1] ? titleMatch[1].trim() : null;
};

/**
 * Extract description from markdown content
 */
export const extractDescription = (
	content: string,
	maxLength = 160,
): string => {
	const lines = content.split("\n");
	const descriptionLines: string[] = [];

	for (const line of lines) {
		if (line.startsWith("#")) continue;
		if (line.trim() === "") continue;
		if (line.startsWith("```")) break;

		descriptionLines.push(line.trim());
		if (descriptionLines.join(" ").length >= maxLength) break;
	}

	const description = descriptionLines.join(" ");
	return description.length > maxLength
		? `${description.substring(0, maxLength - 3)}...`
		: description;
};

/**
 * Extract keywords from markdown content
 */
export const extractKeywords = (content: string): string[] => {
	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 3);

	const frequency: Record<string, number> = {};
	for (const word of words) {
		frequency[word] = (frequency[word] || 0) + 1;
	}

	const sorted = Object.entries(frequency)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10)
		.map(([word]) => word);

	return sorted;
};

/**
 * Generate meta tags from content
 */
export const generateMetaTags = (
	content: string,
	options: SeoOptions = {},
): MetaTags => {
	const title = extractTitle(content);
	const description = extractDescription(content);
	const keywords = extractKeywords(content);

	const metaTags: MetaTags = {
		title: title || undefined,
		description,
		keywords,
	};

	if (options.generateOg) {
		metaTags.ogTitle = title || undefined;
		metaTags.ogDescription = description;
	}

	if (options.generateTwitter) {
		metaTags.twitterCard = "summary_large_image";
	}

	return metaTags;
};
