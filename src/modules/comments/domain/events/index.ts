/**
 * Domain events for comments
 */
export interface CommentAddedEvent {
	readonly type: "COMMENT_ADDED";
	readonly timestamp: number;
	readonly commentId: string;
	readonly author: string;
}

export interface CommentUpdatedEvent {
	readonly type: "COMMENT_UPDATED";
	readonly timestamp: number;
	readonly commentId: string;
}

export interface CommentDeletedEvent {
	readonly type: "COMMENT_DELETED";
	readonly timestamp: number;
	readonly commentId: string;
}

export type CommentsDomainEvent =
	| CommentAddedEvent
	| CommentUpdatedEvent
	| CommentDeletedEvent;

export const createCommentAddedEvent = (
	commentId: string,
	author: string,
): CommentAddedEvent => ({
	type: "COMMENT_ADDED",
	timestamp: Date.now(),
	commentId,
	author,
});

export const createCommentUpdatedEvent = (
	commentId: string,
): CommentUpdatedEvent => ({
	type: "COMMENT_UPDATED",
	timestamp: Date.now(),
	commentId,
});

export const createCommentDeletedEvent = (
	commentId: string,
): CommentDeletedEvent => ({
	type: "COMMENT_DELETED",
	timestamp: Date.now(),
	commentId,
});
