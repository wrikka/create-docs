/**
 * Content Validation Operations
 *
 * Pure functions for content validation
 */

import type {
	ValidationError,
	ValidationOptions,
	ValidationResult,
} from "../types";

/**
 * Validate heading hierarchy
 */
export const validateHeadings = (content: string): ValidationError[] => {
	const errors: ValidationError[] = [];
	const lines = content.split("\n");
	let lastLevel = 0;

	for (const line of lines) {
		const match = line.match(/^(#{1,6})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const lineNum = lines.indexOf(line) + 1;

			if (level > lastLevel + 1) {
				errors.push({
					message: `Heading level ${level} should not be more than one level deeper than ${lastLevel}`,
					line: lineNum,
					severity: "warning",
				});
			}

			lastLevel = level;
		}
	}

	return errors;
};

/**
 * Validate links
 */
export const validateLinks = (content: string): ValidationError[] => {
	const errors: ValidationError[] = [];
	const lines = content.split("\n");

	for (const line of lines) {
		const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
		if (linkMatch) {
			const url = linkMatch[2];
			const lineNum = lines.indexOf(line) + 1;

			if (
				!url.startsWith("http") &&
				!url.startsWith("#") &&
				!url.startsWith("/")
			) {
				errors.push({
					message: `Link "${url}" should be absolute or start with # or /`,
					line: lineNum,
					severity: "warning",
				});
			}
		}
	}

	return errors;
};

/**
 * Validate images
 */
export const validateImages = (content: string): ValidationError[] => {
	const errors: ValidationError[] = [];
	const lines = content.split("\n");

	for (const line of lines) {
		const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
		if (imageMatch) {
			const alt = imageMatch[1];
			const lineNum = lines.indexOf(line) + 1;

			if (!alt) {
				errors.push({
					message: "Image should have alt text",
					line: lineNum,
					severity: "error",
				});
			}
		}
	}

	return errors;
};

/**
 * Validate code blocks
 */
export const validateCodeBlocks = (content: string): ValidationError[] => {
	const errors: ValidationError[] = [];
	const lines = content.split("\n");
	let inCodeBlock = false;
	let codeBlockStart = 0;

	for (const line of lines) {
		const codeMatch = line.match(/^```(\w+)?$/);
		if (codeMatch && !inCodeBlock) {
			inCodeBlock = true;
			codeBlockStart = lines.indexOf(line) + 1;
		} else if (line === "```" && inCodeBlock) {
			inCodeBlock = false;
		}
	}

	if (inCodeBlock) {
		errors.push({
			message: "Unclosed code block",
			line: codeBlockStart,
			severity: "error",
		});
	}

	return errors;
};

/**
 * Validate content
 */
export const validateContent = (
	content: string,
	options: ValidationOptions = {},
): ValidationResult => {
	const errors: ValidationError[] = [];

	if (options.checkHeadings !== false) {
		errors.push(...validateHeadings(content));
	}

	if (options.checkLinks !== false) {
		errors.push(...validateLinks(content));
	}

	if (options.checkImages !== false) {
		errors.push(...validateImages(content));
	}

	if (options.checkCodeBlocks !== false) {
		errors.push(...validateCodeBlocks(content));
	}

	return {
		valid: errors.filter((e) => e.severity === "error").length === 0,
		errors,
	};
};
