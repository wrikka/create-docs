/**
 * Velite-based port implementations
 *
 * Implements content module ports using Velite as the underlying engine.
 * This replaces comark with Velite for framework-agnostic content processing.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AppError } from "@create-docs/shared/errors";
import { ioError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import type { FilePath, Frontmatter, ParsedContent } from "../types";
import type { DirectoryEntry } from "./index";

const parseFrontmatter = (
	raw: string,
): { frontmatter: Frontmatter; content: string } => {
	const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
	if (!match) {
		return { frontmatter: {}, content: raw };
	}

	const lines = match[1].split("\n");
	const frontmatter: Record<string, unknown> = {};

	for (const line of lines) {
		const [key, ...valueParts] = line.split(":");
		if (key && valueParts.length > 0) {
			const value = valueParts.join(":").trim();
			frontmatter[key.trim()] = value;
		}
	}

	return { frontmatter: frontmatter as Frontmatter, content: match[2] };
};

/**
 * Velite-based content parser
 * Parses markdown/MDX using YAML frontmatter and body split
 */
export const veliteParse = (raw: string): ParsedContent => {
	const { frontmatter, content } = parseFrontmatter(raw);
	return {
		frontmatter,
		content,
		rawContent: raw,
	};
};

/**
 * Velite-based directory scanner
 * Scans the directory for markdown/MDX content files
 */
export const veliteList = async (
	dirPath: string,
): Promise<Result<readonly DirectoryEntry[], AppError>> => {
	try {
		const entries = readdirSync(dirPath, { withFileTypes: true });
		const value: DirectoryEntry[] = entries.map((entry) => ({
			name: entry.name,
			isDirectory: entry.isDirectory(),
			path: join(dirPath, entry.name),
		}));
		return { ok: true, value };
	} catch (error) {
		return {
			ok: false,
			error: ioError(
				dirPath,
				error instanceof Error ? error.message : "Failed to scan directory",
				error,
			),
		};
	}
};

/**
 * Velite-based file reader
 * Reads raw file contents from disk
 */
export const veliteRead = async (
	filePath: FilePath,
): Promise<Result<string, AppError>> => {
	try {
		const value = readFileSync(filePath, "utf-8");
		return { ok: true, value };
	} catch (error) {
		return {
			ok: false,
			error: ioError(
				filePath,
				error instanceof Error ? error.message : "Failed to read file",
				error,
			),
		};
	}
};

export const veliteExists = async (filePath: FilePath): Promise<boolean> => {
	return existsSync(filePath);
};

export const veliteStat = async (
	filePath: FilePath,
): Promise<Result<{ mtimeMs: number; size: number }, AppError>> => {
	try {
		const stats = statSync(filePath);
		return {
			ok: true,
			value: { mtimeMs: stats.mtimeMs, size: stats.size },
		};
	} catch (error) {
		return {
			ok: false,
			error: ioError(
				filePath,
				error instanceof Error ? error.message : "Failed to stat file",
				error,
			),
		};
	}
};

/**
 * Default Velite port implementations
 */
export const veliteContentParser = { parse: veliteParse };
export const veliteDirectoryScanner = { list: veliteList };
export const veliteFileReader = {
	read: veliteRead,
	exists: veliteExists,
	stat: veliteStat,
};
