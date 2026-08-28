/**
 * OpenAPI types for API documentation import.
 */

export type OpenApiEndpoint = {
	readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	readonly path: string;
	readonly summary?: string;
	readonly description?: string;
	readonly parameters?: readonly OpenApiParameter[];
	readonly requestBody?: OpenApiRequestBody;
	readonly responses?: Readonly<Record<string, OpenApiResponse>>;
};

export type OpenApiParameter = {
	readonly name: string;
	readonly in: "query" | "path" | "header" | "cookie";
	readonly required: boolean;
	readonly schema?: unknown;
	readonly description?: string;
};

export type OpenApiRequestBody = {
	readonly description?: string;
	readonly required: boolean;
	readonly content?: Readonly<Record<string, OpenApiMediaType>>;
};

export type OpenApiMediaType = {
	readonly schema?: unknown;
	readonly example?: unknown;
};

export type OpenApiResponse = {
	readonly description: string;
	readonly content?: Readonly<Record<string, OpenApiMediaType>>;
};
