/**
 * Pure live preview operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { PreviewConfig, PreviewState } from "../../types/preview";

export type PreviewError = {
	readonly kind: "preview-error";
	readonly message: string;
};

/**
 * Update preview state with new content.
 */
export const updatePreview = (
	state: PreviewState,
	content: string,
): Result<PreviewState, PreviewError> => {
	try {
		return ok({
			...state,
			content,
			error: null,
		});
	} catch (error) {
		return err({
			kind: "preview-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Set preview error.
 */
export const setPreviewError = (
	state: PreviewState,
	error: Error,
): PreviewState => ({
	...state,
	error,
});

/**
 * Toggle preview mode.
 */
export const togglePreview = (
	state: PreviewState,
	_config: PreviewConfig,
): PreviewState => ({
	...state,
	isPreviewing: !state.isPreviewing,
});
