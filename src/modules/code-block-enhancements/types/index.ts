/**
 * Code Block Enhancements Types
 *
 * Domain types for code block enhancements
 */

/**
 * Code block
 */
export interface CodeBlock {
	/** Code content */
	code: string;
	/** Language */
	language?: string;
	/** Line numbers */
	lineNumbers?: boolean;
	/** Highlight lines */
	highlightLines?: number[];
	/** File name */
	filename?: string;
}

/**
 * Code block options
 */
export interface CodeBlockOptions {
	/** Enable line numbers */
	lineNumbers?: boolean;
	/** Highlight lines */
	highlightLines?: number[];
	/** Add copy button */
	copyButton?: boolean;
	/** Add filename */
	filename?: string;
	/** Theme */
	theme?: "light" | "dark" | "auto";
}
