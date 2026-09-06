// Plugin Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import type { ResolvedDocsConfig } from "@create-docs/modules/config";
import { pluginError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { type Type, type } from "arktype";

/**
 * Resolved Config Schema
 */
export const resolvedConfigSchema: Type = type({
	docsDir: "string >= 1",
	baseRoute: "string >= 1",
});

export type ResolvedConfigSchema = typeof resolvedConfigSchema.infer;

/**
 * Validate resolved config using Arktype
 */
export const validateResolvedConfig = (
	c: ResolvedDocsConfig,
): Result<ResolvedDocsConfig, ReturnType<typeof pluginError>> => {
	const result = resolvedConfigSchema(c);
	if (result instanceof type.errors) {
		return err(pluginError(result.summary, { path: "docsDir" }));
	}
	return ok(c);
};
