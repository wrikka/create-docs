/**
 * TypeDoc adapter implementation.
 * Provides API docs generation from TypeScript using TypeDoc.
 */

import type { ApiDocsPort } from "../ports/api-docs-port";
import type { ApiEndpoint } from "../types/api-docs";

export const createTypeDocAdapter = (): ApiDocsPort => ({
	extractEndpoints: async (sourcePath: string, _config?: unknown) => {
		try {
			console.log(
				"TypeDoc integration not yet implemented - requires typedoc dependency",
			);
			console.log(`Source path: ${sourcePath}`);
			return [] as ApiEndpoint[];
		} catch (error) {
			console.error("Failed to extract endpoints:", error);
			return [];
		}
	},

	generateDocs: async (endpoints: readonly unknown[], outputPath: string) => {
		try {
			console.log("TypeDoc documentation generation not yet implemented");
			console.log(`Output path: ${outputPath}`);
			console.log(`Endpoints count: ${endpoints.length}`);
		} catch (error) {
			console.error("Failed to generate docs:", error);
		}
	},
});
