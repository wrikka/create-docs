/**
 * Node FS adapter — concrete implementation of the content module's FileReader
 * and DirectoryScanner ports. This is the ONLY place where node:fs/promises is used.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
	DirectoryEntry,
	DirectoryScanner,
	FilePath,
	FileReader,
	FileWatcher,
} from "@create-docs/modules/content";
import type { AppError } from "@create-docs/shared/errors";
import { fileNotFound, ioError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";

/**
 * Path-traversal safe join. Rejects any attempt to resolve to a path outside
 * the configured root. Throws an Error containing the absolute resolved path
 * on violation; callers should treat as AppError.io_error upstream.
 */
export const safeJoin = (root: string, requested: string): string => {
	const absRoot = path.resolve(root);
	const cleaned = requested.replace(/^[\\/]+/, "");
	const candidate = path.resolve(absRoot, cleaned);
	const rel = path.relative(absRoot, candidate);
	if (rel.startsWith("..") || rel === ".." || path.isAbsolute(rel)) {
		throw new Error(`Path traversal blocked: ${requested} -> ${candidate}`);
	}
	return candidate;
};

export const nodeFileReader: FileReader = {
	async read(filePath: FilePath): Promise<Result<string, AppError>> {
		try {
			const content = await fs.readFile(String(filePath), "utf-8");
			return ok(content);
		} catch (e) {
			const code = (e as NodeJS.ErrnoException).code;
			if (code === "ENOENT") return err(fileNotFound(String(filePath), e));
			return err(ioError(String(filePath), "Failed to read file", e));
		}
	},
	async exists(filePath: FilePath): Promise<boolean> {
		try {
			await fs.access(String(filePath));
			return true;
		} catch {
			return false;
		}
	},
	async stat(
		filePath: FilePath,
	): Promise<Result<{ mtimeMs: number; size: number }, AppError>> {
		try {
			const s = await fs.stat(String(filePath));
			return ok({ mtimeMs: s.mtimeMs, size: s.size });
		} catch (e) {
			const code = (e as NodeJS.ErrnoException).code;
			if (code === "ENOENT") return err(fileNotFound(String(filePath), e));
			return err(ioError(String(filePath), "Failed to stat file", e));
		}
	},
};

export const nodeDirectoryScanner: DirectoryScanner = {
	async list(
		dirPath: string,
	): Promise<Result<readonly DirectoryEntry[], AppError>> {
		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true });
			return ok(
				entries.map((entry) => ({
					name: entry.name,
					isDirectory: entry.isDirectory(),
					path: path.join(dirPath, entry.name),
				})),
			);
		} catch (e) {
			const code = (e as NodeJS.ErrnoException).code;
			if (code === "ENOENT") return err(fileNotFound(dirPath, e));
			return err(ioError(dirPath, "Failed to read directory", e));
		}
	},
};

export const nodeFileWatcher: FileWatcher = {
	watch(dir, handlers) {
		const ac = new AbortController();
		const iterator = fs
			.watch(dir, { recursive: true, signal: ac.signal } as fs.WatchOptions)
			[Symbol.asyncIterator]();
		const consume = async (): Promise<void> => {
			try {
				for await (const event of iterator) {
					const filename = (event as { filename?: unknown }).filename;
					if (
						typeof filename === "string" &&
						(filename.endsWith(".md") || filename.endsWith(".mdoc"))
					) {
						handlers.onChange(filename);
					}
				}
			} catch (e) {
				handlers.onError(e);
			}
		};
		void consume();
		return {
			close: () => {
				ac.abort();
			},
		};
	},
};
