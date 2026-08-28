/**
 * Giscus adapter implementation.
 * Provides Giscus comment integration.
 */

import type { CommentPort } from "../ports/comment-port";
import type { Comment } from "../types/comments";

export const createGiscusAdapter = (
	repo: string,
	repoId: string,
): CommentPort => ({
	load: async (pageId: string, _config?: unknown) => {
		try {
			console.log(
				`Giscus loading not yet implemented - requires giscus dependency`,
			);
			console.log(`Repo: ${repo}`);
			console.log(`Repo ID: ${repoId}`);
			console.log(`Page ID: ${pageId}`);
			return [] as Comment[];
		} catch (error) {
			console.error("Failed to load comments:", error);
			return [];
		}
	},

	submit: async (_comment: unknown, _config?: unknown) => {
		try {
			console.log(
				`Giscus submission not yet implemented - requires giscus dependency`,
			);
			console.log(`Repo: ${repo}`);
		} catch (error) {
			console.error("Failed to submit comment:", error);
		}
	},
});
