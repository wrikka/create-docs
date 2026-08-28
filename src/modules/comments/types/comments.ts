/**
 * Comment system types for user comments on documentation pages.
 */

export type Comment = {
	readonly id: string;
	readonly pageId: string;
	readonly author: string;
	readonly content: string;
	readonly createdAt: string;
	readonly updatedAt: string;
};

export type CommentConfig = {
	readonly provider: "giscus" | "utterances" | "disqus" | "none";
	readonly repo?: string;
	readonly repoId?: string;
	readonly theme?: string;
};
