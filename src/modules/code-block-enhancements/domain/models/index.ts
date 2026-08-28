/**
 * Domain models for code block enhancements
 */
export interface CodeBlock {
	readonly id: string;
	readonly language: string;
	readonly code: string;
	readonly lineNumbers: boolean;
	readonly syntaxHighlighting: boolean;
}

export interface CodeEnhancement {
	readonly type: "copy" | "download" | "fullscreen" | "line-highlight";
	readonly enabled: boolean;
}

export const createCodeBlock = (
	id: string,
	language: string,
	code: string,
	options?: { lineNumbers?: boolean; syntaxHighlighting?: boolean },
): CodeBlock => ({
	id,
	language,
	code,
	lineNumbers: options?.lineNumbers ?? true,
	syntaxHighlighting: options?.syntaxHighlighting ?? true,
});

export const createCodeEnhancement = (
	type: CodeEnhancement["type"],
	enabled: boolean,
): CodeEnhancement => ({
	type,
	enabled,
});
