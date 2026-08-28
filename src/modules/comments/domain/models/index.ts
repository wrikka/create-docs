/**
 * Domain models for comments
 */
export interface Comment {
	readonly id: string;
	readonly author: string;
	readonly content: string;
	readonly timestamp: number;
	readonly parentId?: string;
	readonly replies?: readonly Comment[];
}

export const createComment = (
	id: string,
	author: string,
	content: string,
	options?: {
		parentId?: string;
		replies?: readonly Comment[];
		timestamp?: number;
	},
): Comment => ({
	id,
	author,
	content,
	parentId: options?.parentId,
	replies: options?.replies,
	timestamp: options?.timestamp ?? Date.now(),
});
