/**
 * mtime+size keyed parse cache.
 *
 * Skips re-parsing files whose mtime and size have not changed since the
 * last build. Pure — no I/O. Designed to be wrapped by an outer Map keyed
 * by absolute file path.
 */

export interface CacheKeyParts {
	readonly mtimeMs: number;
	readonly size: number;
}

export interface CacheEntry<T> {
	readonly key: string;
	readonly value: T;
}

/** Build a stable cache key from a file path and stat info. */
export const makeCacheKey = (filePath: string, parts: CacheKeyParts): string =>
	`${filePath}@${parts.mtimeMs.toFixed(0)}:${parts.size}`;

/**
 * Simple bounded parse cache with LRU-like eviction.
 */
export class ParseCache<T> {
	private map = new Map<string, T>();

	constructor(private max: number = 1024) {}

	get(key: string): T | undefined {
		return this.map.get(key);
	}

	set(key: string, value: T): void {
		if (this.map.has(key)) this.map.delete(key);
		this.map.set(key, value);

		if (this.map.size > this.max) {
			const oldest = this.map.keys().next().value;
			if (oldest !== undefined) this.map.delete(oldest);
		}
	}

	has(key: string): boolean {
		return this.map.has(key);
	}

	clear(): void {
		this.map.clear();
	}

	get size(): number {
		return this.map.size;
	}
}
