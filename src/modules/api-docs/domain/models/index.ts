/**
 * Domain models for API docs
 */
export interface ApiEndpoint {
	readonly path: string;
	readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	readonly description: string;
	readonly parameters?: ReadonlyArray<ApiParameter>;
}

export interface ApiParameter {
	readonly name: string;
	readonly type: string;
	readonly required: boolean;
	readonly description: string;
}

export const createApiEndpoint = (
	path: string,
	method: ApiEndpoint["method"],
	description: string,
	parameters?: ReadonlyArray<ApiParameter>,
): ApiEndpoint => ({
	path,
	method,
	description,
	parameters,
});

export const createApiParameter = (
	name: string,
	type: string,
	required: boolean,
	description: string,
): ApiParameter => ({
	name,
	type,
	required,
	description,
});
