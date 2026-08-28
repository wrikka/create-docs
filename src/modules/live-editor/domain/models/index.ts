/**
 * Domain models for live editor
 */
export interface EditorState {
	readonly content: string;
	readonly language: string;
	readonly cursorPosition: { line: number; column: number };
	readonly selection?: { start: number; end: number };
}

export const createEditorState = (
	content: string,
	language: string,
	cursorPosition: { line: number; column: number },
	options?: { selection?: { start: number; end: number } },
): EditorState => ({
	content,
	language,
	cursorPosition,
	selection: options?.selection,
});
