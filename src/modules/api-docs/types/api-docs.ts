/**
 * API docs types for auto-generating API documentation.
 */

export type ApiDocsConfig = {
	readonly source: "openapi" | "typescript" | "graphql";
	readonly sourcePath: string;
	readonly outputPath: string;
};

export type ApiEndpoint = {
	readonly path: string;
	readonly method: string;
	readonly description: string;
};
