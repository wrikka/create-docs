/**
 * In-memory FS adapter for tests and SSR scenarios.
 * Implements FileReader + DirectoryScanner without touching the disk.
 */

import type {
	DirectoryEntry,
	DirectoryScanner,
	FilePath,
	FileReader,
} from "@create-docs/modules/content";
import type { AppError } from "@create-docs/shared/errors";
import { fileNotFound } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";

export interface MemoryFileSystem {
	readonly files: ReadonlyMap<string, string>;
	readonly directories: ReadonlyMap<string, readonly string[]>;
}

export const memoryFileSystem = (
	files: ReadonlyMap<string, string>,
	directories: ReadonlyMap<string, readonly string[]>,
): MemoryFileSystem => ({ files, directories });

export const createMemoryFileReader = (fs: MemoryFileSystem): FileReader => ({
	async read(filePath: FilePath): Promise<Result<string, AppError>> {
		const content = fs.files.get(String(filePath));
		if (content === undefined) return err(fileNotFound(String(filePath)));
		return ok(content);
	},
	async exists(filePath: FilePath): Promise<boolean> {
		return fs.files.has(String(filePath));
	},
	async stat(
		filePath: FilePath,
	): Promise<Result<{ mtimeMs: number; size: number }, AppError>> {
		const content = fs.files.get(String(filePath));
		if (content === undefined) return err(fileNotFound(String(filePath)));
		return ok({ mtimeMs: 0, size: content.length });
	},
});

export const createMemoryDirectoryScanner = (
	fs: MemoryFileSystem,
): DirectoryScanner => ({
	async list(
		dirPath: string,
	): Promise<Result<readonly DirectoryEntry[], AppError>> {
		const entries = fs.directories.get(dirPath);
		if (entries === undefined) return err(fileNotFound(dirPath));
		return ok(
			entries.map((name) => ({
				name,
				isDirectory: !name.includes("."),
				path: `${dirPath.replace(/\/$/, "")}/${name}`,
			})),
		);
	},
});
