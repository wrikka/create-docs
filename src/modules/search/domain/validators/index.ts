// Search Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { validationError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { type Type, type } from "arktype";
import type { SearchEntry } from "../../types";

/**
 * Search Entry Schema
 */
export const searchEntrySchema: Type = type({
	id: "string >= 1",
	slug: "string >= 1",
	title: "string >= 1",
});

export type SearchEntrySchema = typeof searchEntrySchema.infer;

/**
 * Validate search entry using Arktype
 */
export const validateSearchEntry = (
	e: SearchEntry,
	path: string,
): Result<SearchEntry, ReturnType<typeof validationError>> => {
	const result = searchEntrySchema(e);
	if (result instanceof type.errors) {
		return err(validationError(result.summary, { path }));
	}
	return ok(e);
};
