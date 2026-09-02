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
	now: number = Date.now(),
): CommentAddedEvent => ({
	type: "COMMENT_ADDED",
	timestamp: now,
	commentId,
	author,
});

export const createCommentUpdatedEvent = (
	commentId: string,
	now: number = Date.now(),
): CommentUpdatedEvent => ({
	type: "COMMENT_UPDATED",
	timestamp: now,
	commentId,
});

export const createCommentDeletedEvent = (
	commentId: string,
	now: number = Date.now(),
): CommentDeletedEvent => ({
	type: "COMMENT_DELETED",
	timestamp: now,
	commentId,
});
