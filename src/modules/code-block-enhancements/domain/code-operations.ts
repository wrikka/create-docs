/**
 * Code Block Operations
 *
 * Pure functions for code block enhancements
 */

import type { CodeBlock, CodeBlockOptions } from "../types";

/**
 * Parse code blocks from markdown content
 */
export const parseCodeBlocks = (content: string): CodeBlock[] => {
	const codeBlocks: CodeBlock[] = [];
	const lines = content.split("\n");
	let inCodeBlock = false;
	let currentBlock: Partial<CodeBlock> = {};
	let codeLines: string[] = [];

	for (const line of lines) {
		const codeMatch = line.match(/^```(\w+)?\s*(.*)?$/);
		const endMatch = line.match(/^```$/);

		if (codeMatch && !inCodeBlock) {
			inCodeBlock = true;
			currentBlock = {
				language: codeMatch[1] || undefined,
				filename: codeMatch[2] || undefined,
			};
			codeLines = [];
		} else if (endMatch && inCodeBlock) {
			inCodeBlock = false;
			currentBlock.code = codeLines.join("\n");
			codeBlocks.push(currentBlock as CodeBlock);
			currentBlock = {};
			codeLines = [];
		} else if (inCodeBlock) {
			codeLines.push(line);
		}
	}

	return codeBlocks;
};

/**
 * Enhance code block with options
 */
export const enhanceCodeBlock = (
	block: CodeBlock,
	options: CodeBlockOptions = {},
): CodeBlock => {
	return {
		...block,
		lineNumbers: options.lineNumbers ?? true,
		highlightLines: options.highlightLines || block.highlightLines,
		filename: options.filename || block.filename,
	};
};

/**
 * Add line numbers to code
 */
export const addLineNumbers = (code: string): string => {
	const lines = code.split("\n");
	const maxDigits = lines.length.toString().length;

	return lines
		.map((line, index) => {
			const lineNumber = (index + 1).toString().padStart(maxDigits, " ");
			return `${lineNumber} | ${line}`;
		})
		.join("\n");
};
