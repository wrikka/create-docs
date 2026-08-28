/**
 * Port for OpenAPI parsing operations.
 */

export type OpenApiParserPort = {
	/**
	 * Parse OpenAPI 3 schema from file or URL.
	 */
	readonly parse: (source: string) => Promise<unknown>;

	/**
	 * Validate OpenAPI 3 schema.
	 */
	readonly validate: (schema: unknown) => Promise<boolean>;
};
