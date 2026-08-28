/**
 * Code Block Enhancements Ports
 *
 * Module-specific interfaces for code block enhancements
 */

import type { CodeBlock, CodeBlockOptions } from "../types";

/**
 * Syntax highlighter interface
 */
export interface SyntaxHighlighter {
	/** Highlight code with language */
	highlight(code: string, language: string): Promise<string>;
}

// Re-export types for convenience
export type { CodeBlock, CodeBlockOptions };
