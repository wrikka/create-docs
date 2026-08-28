/**
 * Live Editor Presentation
 *
 * Presentation layer for live editor with Git integration
 */

export {
	createLiveEditorState,
	type EditorMode,
	type LiveEditorOptions,
	type LiveEditorState,
	liveEditorAttachEventListeners,
	liveEditorDestroy,
	liveEditorInitEditor,
	liveEditorRender,
	liveEditorSetMode,
	liveEditorUpdateGitStatus,
} from "./live-editor-component";
export {
	LIVE_EDITOR_MODULE_ID,
	liveEditorVirtualModuleCode,
} from "./virtual-module";
