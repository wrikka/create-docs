/**
 * Code Block Enhancements Use Cases
 *
 * Orchestration layer for code block enhancements
 */

import {
	addLineNumbers,
	enhanceCodeBlock,
	parseCodeBlocks,
} from "../../domain";
import type { CodeBlockOptions } from "../../types";

/**
 * Enhance all code blocks in markdown content
 */
export const enhanceCodeBlocks = (
	content: string,
	options: CodeBlockOptions = {},
): string => {
	const codeBlocks = parseCodeBlocks(content);
	let enhancedContent = content;

	for (const block of codeBlocks) {
		const enhanced = enhanceCodeBlock(block, options);
		const originalCode = block.code;
		const newCode = enhanced.lineNumbers
			? addLineNumbers(originalCode)
			: originalCode;

		// Replace code block in content
		enhancedContent = enhancedContent.replace(
			`\`\`\`${block.language || ""}${block.filename ? ` ${block.filename}` : ""}\n${originalCode}\n\`\`\``,
			`\`\`\`${enhanced.language || ""}${enhanced.filename ? ` ${enhanced.filename}` : ""}\n${newCode}\n\`\`\``,
		);
	}

	return enhancedContent;
};
