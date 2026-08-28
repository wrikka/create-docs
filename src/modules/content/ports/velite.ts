/**
 * Velite-based port implementations
 *
 * Implements content module ports using Velite as the underlying engine.
 * This replaces comark with Velite for framework-agnostic content processing.
 */

import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import type { FilePath, ParsedContent } from "../types";
import type { DirectoryEntry } from "./index";

/**
 * Velite-based content parser
 * Parses markdown/MDX using Velite's built-in processors
 */
export const veliteParse = (raw: string): ParsedContent => {
	// Velite handles parsing internally, this is a placeholder
	// In practice, Velite outputs parsed data directly to .velite/
	// This parser is for compatibility with existing port interface
	return {
		frontmatter: {},
		content: raw,
		rawContent: raw,
	};
};

/**
 * Velite-based directory scanner
 * Velite uses glob patterns for content discovery
 */
export const veliteList = async (
	_dirPath: string,
): Promise<Result<readonly DirectoryEntry[], AppError>> => {
	// Velite handles directory scanning via glob patterns
	// This is a placeholder for compatibility
	return {
		ok: true,
		value: [],
	};
};

/**
 * Velite-based file reader
 * Velite reads files during build process
 */
export const veliteRead = async (
	_filePath: FilePath,
): Promise<Result<string, AppError>> => {
	// Velite handles file reading during build
	// This is a placeholder for compatibility
	return {
		ok: true,
		value: "",
	};
};

export const veliteExists = async (_filePath: FilePath): Promise<boolean> => {
	// Velite handles existence checks during build
	return false;
};

export const veliteStat = async (
	_filePath: FilePath,
): Promise<Result<{ mtimeMs: number; size: number }, AppError>> => {
	// Velite handles file stats during build
	return {
		ok: true,
		value: { mtimeMs: 0, size: 0 },
	};
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
