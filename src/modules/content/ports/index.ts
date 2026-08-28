/**
 * Content module ports — interfaces that the application layer depends on
 * to perform I/O. Adapters provide concrete implementations.
 */

import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import type { FilePath, ParsedContent } from "../types";

/** Reads raw file contents from disk. */
export interface FileReader {
	read(filePath: FilePath): Promise<Result<string, AppError>>;
	exists(filePath: FilePath): Promise<boolean>;
	stat(
		filePath: FilePath,
	): Promise<Result<{ mtimeMs: number; size: number }, AppError>>;
}

/** Reads directory entries, recursively. */
export interface DirectoryScanner {
	list(dirPath: string): Promise<Result<readonly DirectoryEntry[], AppError>>;
}

/** A single entry returned by a directory scanner. */
export interface DirectoryEntry {
	readonly name: string;
	readonly isDirectory: boolean;
	readonly path: string;
}

/** Parses a raw file's content into structured data. */
export interface ContentParser {
	parse(raw: string): ParsedContent;
}

/** Watches a directory for file system changes. */
export interface FileWatcher {
	watch(
		dir: string,
		handlers: {
			onChange: (filePath: string) => void;
			onError: (err: unknown) => void;
		},
	): { close: () => void };
}
