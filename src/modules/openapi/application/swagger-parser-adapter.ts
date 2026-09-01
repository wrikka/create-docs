/**
 * Swagger-parser adapter implementation.
 * Provides OpenAPI 3 schema parsing and validation using js-yaml and native fetch.
 */

import { parseError } from "@create-docs/shared/errors";
import { JSON_SCHEMA, load } from "js-yaml";
import type { OpenApiParserPort } from "../ports/openapi-parser-port";
import type {
	OpenApiEndpoint,
	OpenApiMediaType,
	OpenApiParameter,
	OpenApiRequestBody,
	OpenApiResponse,
} from "../types/openapi";

const loadRaw = async (source: string): Promise<string> => {
	if (/^https?:\/\//i.test(source)) {
		const response = await fetch(source);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return response.text();
	}

	if (source.startsWith("file://")) {
		return Bun.file(source.slice(7)).text();
	}

	if (/\.(?:yaml|yml|json)$/i.test(source)) {
		try {
			return await Bun.file(source).text();
		} catch {
			// Fall through and treat the source as raw text.
		}
	}

	return source;
};

const parseText = (raw: string): unknown => {
	const text = raw.trim();
	if (text.startsWith("{") || text.startsWith("[")) {
		return JSON.parse(text);
	}
	return load(text, { schema: JSON_SCHEMA });
};

const toParameter = (value: unknown): OpenApiParameter => {
	const p = value as Record<string, unknown>;
	return {
		name: typeof p.name === "string" ? p.name : "",
		in: (p.in as OpenApiParameter["in"]) ?? "query",
		required: Boolean(p.required),
		schema: p.schema,
		description: typeof p.description === "string" ? p.description : undefined,
	};
};

const toMediaTypes = (
	value: unknown,
): Readonly<Record<string, OpenApiMediaType>> => {
	if (!value || typeof value !== "object") return {};
	const record: Record<string, OpenApiMediaType> = {};
	for (const [key, media] of Object.entries(value as Record<string, unknown>)) {
		const m = media as Record<string, unknown>;
		record[key] = {
			schema: m?.schema,
			example: m?.example,
		};
	}
	return record;
};

const toRequestBody = (value: unknown): OpenApiRequestBody => {
	const body = value as Record<string, unknown>;
	return {
		description:
			typeof body.description === "string" ? body.description : undefined,
		required: Boolean(body.required),
		content: toMediaTypes(body.content),
	};
};

const toResponses = (
	value: unknown,
): Readonly<Record<string, OpenApiResponse>> => {
	if (!value || typeof value !== "object") return {};
	const record: Record<string, OpenApiResponse> = {};
	for (const [code, response] of Object.entries(
		value as Record<string, unknown>,
	)) {
		const r = response as Record<string, unknown>;
		record[code] = {
			description: typeof r.description === "string" ? r.description : "",
			content: toMediaTypes(r.content),
		};
	}
	return record;
};

const extractEndpoints = (
	spec: Record<string, unknown>,
): readonly OpenApiEndpoint[] => {
	const paths = spec.paths as Record<string, unknown> | undefined;
	if (!paths || typeof paths !== "object") return [];

	const endpoints: OpenApiEndpoint[] = [];
	const methods = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

	for (const [path, operations] of Object.entries(paths)) {
		if (!operations || typeof operations !== "object") continue;

		for (const [method, operation] of Object.entries(
			operations as Record<string, unknown>,
		)) {
			const upperMethod = method.toUpperCase();
			if (!methods.has(upperMethod)) continue;

			const op = operation as Record<string, unknown> | undefined;
			if (!op) continue;

			const parameters = Array.isArray(op.parameters)
				? op.parameters.map(toParameter)
				: [];

			endpoints.push({
				method: upperMethod as OpenApiEndpoint["method"],
				path,
				summary: typeof op.summary === "string" ? op.summary : undefined,
				description:
					typeof op.description === "string" ? op.description : undefined,
				parameters,
				requestBody:
					op.requestBody && typeof op.requestBody === "object"
						? toRequestBody(op.requestBody)
						: undefined,
				responses: toResponses(op.responses),
			});
		}
	}

	return endpoints;
};

export const createSwaggerParserAdapter = (): OpenApiParserPort => ({
	parse: async (source: string) => {
		try {
			const raw = await loadRaw(source);
			const parsed = parseText(raw) as Record<string, unknown>;
			return extractEndpoints(parsed);
		} catch (error) {
			throw parseError(source, "Failed to parse OpenAPI spec", error);
		}
	},

	validate: async (schema: unknown) => {
		if (Array.isArray(schema)) {
			return schema.every(
				(item) =>
					item &&
					typeof (item as Record<string, unknown>).method === "string" &&
					typeof (item as Record<string, unknown>).path === "string",
			);
		}

		if (typeof schema !== "object" || schema === null) {
			return false;
		}

		const s = schema as Record<string, unknown>;
		return (
			("openapi" in s || "swagger" in s) &&
			typeof s.paths === "object" &&
			s.paths !== null
		);
	},
});
