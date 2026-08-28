/**
 * Live Editor Component (Vanilla JS)
 *
 * Live editor with split view (preview/edit) using CodeMirror
 */

import { basicSetup } from "@codemirror/basic-setup";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { CommitOptions, GitStatus } from "../../modules/live-editor/types";

export interface LiveEditorOptions {
	/** Container element */
	container: HTMLElement;
	/** Initial content */
	initialContent: string;
	/** Git status */
	gitStatus?: GitStatus;
	/** On save callback */
	onSave?: (content: string) => Promise<void>;
	/** On commit callback */
	onCommit?: (options: CommitOptions) => Promise<void>;
	/** On push callback */
	onPush?: () => Promise<void>;
}

export type EditorMode = "preview" | "edit" | "split";

// Live editor state
export interface LiveEditorState {
	readonly container: HTMLElement;
	readonly editorView: EditorView | null;
	readonly previewElement: HTMLElement;
	readonly content: string;
	readonly gitStatus?: GitStatus;
	readonly onSave?: (content: string) => Promise<void>;
	readonly onCommit?: (options: CommitOptions) => Promise<void>;
	readonly onPush?: () => Promise<void>;
	readonly mode: EditorMode;
}

export const createLiveEditorState = (
	options: LiveEditorOptions,
): LiveEditorState => ({
	container: options.container,
	editorView: null,
	previewElement: document.createElement("div"),
	content: options.initialContent,
	gitStatus: options.gitStatus,
	onSave: options.onSave,
	onCommit: options.onCommit,
	onPush: options.onPush,
	mode: "split",
});

export const liveEditorRender = (state: LiveEditorState): LiveEditorState => {
	state.container.innerHTML = "";

	// Toolbar
	const toolbar = document.createElement("div");
	toolbar.className = "live-editor-toolbar";
	toolbar.innerHTML = `
		<div class="toolbar-left">
			<button data-mode="preview" class="${state.mode === "preview" ? "active" : ""}">Preview</button>
			<button data-mode="edit" class="${state.mode === "edit" ? "active" : ""}">Edit</button>
			<button data-mode="split" class="${state.mode === "split" ? "active" : ""}">Split</button>
		</div>
		<div class="toolbar-right">
			${state.gitStatus ? `<span class="git-status">${state.gitStatus.branch} ${state.gitStatus.hasChanges ? "(modified)" : ""}</span>` : ""}
			<button class="save-btn">Save</button>
			<button class="commit-btn">Commit</button>
			<button class="push-btn">Push</button>
		</div>
	`;

	// Commit input
	const commitInput = document.createElement("div");
	commitInput.className = "commit-input";
	commitInput.innerHTML = `
		<input type="text" placeholder="Commit message..." class="commit-message-input">
	`;

	// Content area
	const contentArea = document.createElement("div");
	contentArea.className = `live-editor-content mode-${state.mode}`;

	// Editor pane
	const editorPane = document.createElement("div");
	editorPane.className = "editor-pane";

	// Preview pane
	const previewElement = document.createElement("div");
	previewElement.className = "preview-pane";
	previewElement.innerHTML = state.content;

	contentArea.appendChild(editorPane);
	contentArea.appendChild(previewElement);

	state.container.appendChild(toolbar);
	state.container.appendChild(commitInput);
	state.container.appendChild(contentArea);

	// Initialize CodeMirror
	const editorView = liveEditorInitEditor(state, editorPane);

	// Event listeners
	liveEditorAttachEventListeners(state, toolbar, commitInput);

	return {
		...state,
		editorView,
		previewElement,
	};
};

export const liveEditorInitEditor = (
	state: LiveEditorState,
	container: HTMLElement,
): EditorView => {
	const editorState = EditorState.create({
		doc: state.content,
		extensions: [basicSetup, markdown()],
	});

	const editorView = new EditorView({
		state: editorState,
		parent: container,
	});

	editorView.contentDOM.addEventListener("input", () => {
		// Content update would be handled by state update
	});

	return editorView;
};

export const liveEditorAttachEventListeners = (
	state: LiveEditorState,
	toolbar: HTMLElement,
	commitInput: HTMLElement,
): void => {
	// Mode buttons
	toolbar.querySelectorAll("[data-mode]").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			void ((e.target as HTMLElement).dataset.mode as EditorMode);
			// Mode change would be handled by state update
		});
	});

	// Save button
	toolbar.querySelector(".save-btn")?.addEventListener("click", async () => {
		if (state.onSave) {
			await state.onSave(state.content);
		}
	});

	// Commit button
	toolbar.querySelector(".commit-btn")?.addEventListener("click", async () => {
		const input = commitInput.querySelector(
			".commit-message-input",
		) as HTMLInputElement;
		const message = input.value;
		if (state.onCommit && message) {
			await state.onCommit({ message });
			input.value = "";
		}
	});

	// Push button
	toolbar.querySelector(".push-btn")?.addEventListener("click", async () => {
		if (state.onPush) {
			await state.onPush();
		}
	});
};

export const liveEditorSetMode = (
	state: LiveEditorState,
	mode: EditorMode,
): LiveEditorState => {
	const contentArea = state.container.querySelector(
		".live-editor-content",
	) as HTMLElement;
	contentArea.className = `live-editor-content mode-${mode}`;

	// Update active button
	state.container.querySelectorAll("[data-mode]").forEach((btn) => {
		const btnMode = (btn as HTMLElement).dataset.mode;
		if (btnMode) {
			(btn as HTMLElement).classList.toggle("active", btnMode === mode);
		}
	});

	return {
		...state,
		mode,
	};
};

export const liveEditorUpdateGitStatus = (
	state: LiveEditorState,
	status: GitStatus,
): LiveEditorState => {
	const statusEl = state.container.querySelector(".git-status");
	if (statusEl) {
		statusEl.textContent = `${status.branch} ${status.hasChanges ? "(modified)" : ""}`;
	}

	return {
		...state,
		gitStatus: status,
	};
};

export const liveEditorDestroy = (state: LiveEditorState): void => {
	state.editorView?.destroy();
	state.container.innerHTML = "";
};
