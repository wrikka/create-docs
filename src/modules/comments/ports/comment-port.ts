/**
 * Port for comment operations.
 */

export type CommentPort = {
	/**
	 * Load comments for a page.
	 */
	readonly load: (
		pageId: string,
		config: unknown,
	) => Promise<readonly unknown[]>;

	/**
	 * Submit a new comment.
	 */
	readonly submit: (comment: unknown, config: unknown) => Promise<void>;
};
