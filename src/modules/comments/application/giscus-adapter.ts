/**
 * Giscus adapter implementation.
 * Provides a safe server-side placeholder for Giscus comment integration.
 */

import { configError, pluginError } from "@create-docs/shared/errors";
import type { CommentPort } from "../ports/comment-port";

type GiscusConfig = {
	readonly category?: string;
	readonly categoryId?: string;
};

export const createGiscusAdapter = (
	repo: string,
	repoId: string,
): CommentPort => {
	if (!repo.trim() || !repoId.trim()) {
		throw configError("Giscus repo and repoId are required", {
			context: { repo, repoId },
			hint: "Pass a GitHub repo identifier and giscus repoId.",
		});
	}

	return {
		load: async (pageId: string, config?: unknown) => {
			const cfg = config as GiscusConfig | undefined;

			if (!cfg?.category && !cfg?.categoryId) {
				throw configError("Giscus category or categoryId is required", {
					context: { repo, repoId, pageId },
					hint: "Set category and categoryId in the comment config.",
				});
			}

			throw pluginError(
				"Giscus comments require the @giscus/react client component and a GitHub Discussions repository.",
				{
					context: { repo, repoId, pageId },
					hint: "Install and configure @giscus/react, or switch to a different comment provider.",
				},
			);
		},

		submit: async (_comment: unknown, _config?: unknown) => {
			throw pluginError(
				"Giscus submission requires the @giscus/react client component.",
				{
					context: { repo, repoId },
					hint: "Install and configure @giscus/react, or switch to a different comment provider.",
				},
			);
		},
	};
};
