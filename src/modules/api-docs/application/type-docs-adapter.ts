/**
 * TypeDoc adapter implementation.
 * Provides a safe placeholder for API docs generation from TypeScript.
 */

import { configError, ioError, pluginError } from "@create-docs/shared/errors";
import type { ApiDocsPort } from "../ports/api-docs-port";

const TYPEDOC_MISSING_ERROR =
	"TypeDoc is not installed. Generating API docs from TypeScript requires the typedoc package.";

export const createTypeDocAdapter = (): ApiDocsPort => ({
	extractEndpoints: async (sourcePath: string, _config?: unknown) => {
		if (!sourcePath.trim()) {
			throw configError("TypeDoc sourcePath is required", {
				context: { sourcePath },
			});
		}

		throw ioError(sourcePath, TYPEDOC_MISSING_ERROR);
	},

	generateDocs: async (_endpoints: readonly unknown[], outputPath: string) => {
		if (!outputPath.trim()) {
			throw configError("TypeDoc outputPath is required", {
				context: { outputPath },
			});
		}

		throw pluginError(TYPEDOC_MISSING_ERROR, {
			context: { outputPath },
		});
	},
});
