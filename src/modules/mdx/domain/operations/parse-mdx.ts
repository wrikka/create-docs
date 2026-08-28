/**
 * Pure MDX parser operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { MdxOptions } from "../../types/mdx";

export type MdxParseError = {
	readonly kind: "mdx-parse-error";
	readonly message: string;
	readonly line?: number;
	readonly column?: number;
};

/**
 * Parse MDX string to component code.
 * Uses @mdx-js/mdx adapter.
 */
export const parseMdx = (
	raw: string,
	_options: MdxOptions = {},
): Result<string, MdxParseError> => {
	try {
		// This will be implemented via adapter
		// For now, return the raw content as-is
		return ok(raw);
	} catch (error) {
		return err({
			kind: "mdx-parse-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Determine if a file is an MDX file.
 */
export const isMdxFile = (fileName: string): boolean =>
	fileName.endsWith(".mdx") ||
	fileName.endsWith(".mdx.tsx") ||
	fileName.endsWith(".mdx.jsx");
