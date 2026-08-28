/**
 * Pure external search operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type {
	ExternalSearchConfig,
	ExternalSearchResult,
} from "../../types/search";

export type ExternalSearchError = {
	readonly kind: "external-search-error";
	readonly message: string;
};

/**
 * Search external index with query.
 */
export const searchExternal = (
	_query: string,
	_config: ExternalSearchConfig,
): Result<readonly ExternalSearchResult[], ExternalSearchError> => {
	try {
		// This will be implemented via adapter
		// For now, return empty array
		return ok([]);
	} catch (error) {
		return err({
			kind: "external-search-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Index documents to external search.
 */
export const indexToExternal = (
	_docs: readonly unknown[],
	_config: ExternalSearchConfig,
): Result<void, ExternalSearchError> => {
	try {
		// This will be implemented via adapter
		return ok(undefined);
	} catch (error) {
		return err({
			kind: "external-search-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
