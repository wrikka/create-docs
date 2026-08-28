/**
 * Domain models for version control
 */
export interface Version {
	readonly id: string;
	readonly number: string;
	readonly timestamp: number;
	readonly author: string;
	readonly message: string;
}

export const createVersion = (
	id: string,
	number: string,
	author: string,
	message: string,
	options?: { timestamp?: number },
): Version => ({
	id,
	number,
	author,
	message,
	timestamp: options?.timestamp ?? Date.now(),
});
