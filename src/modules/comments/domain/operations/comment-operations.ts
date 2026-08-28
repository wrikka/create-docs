/**
 * Pure comment operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { Comment, CommentConfig } from "../../types/comments";

export type CommentError = {
	readonly kind: "comment-error";
	readonly message: string;
};

/**
 * Validate comment content.
 */
export const validateComment = (content: string): boolean => {
	if (content.length === 0) return false;
	if (content.length > 5000) return false;
	return true;
};

/**
 * Format comment for display.
 */
export const formatComment = (comment: Comment): string => {
	return comment.content;
};

/**
 * Get comment widget config.
 */
export const getCommentWidgetConfig = (
	_config: CommentConfig,
): Result<unknown, CommentError> => {
	try {
		// This will be implemented via adapter
		return ok({});
	} catch (error) {
		return err({
			kind: "comment-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
