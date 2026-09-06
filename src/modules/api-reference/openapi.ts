/**
 * Browser-safe OpenAPI → ApiEndpoint adapter.
 * Accepts a spec object, JSON/YAML string, or URL.
 */

import { JSON_SCHEMA, load } from "js-yaml";
import type {
	ApiEndpoint,
	ApiParameter,
	HttpMethod,
} from "../../runtime/types";

const METHODS = new Set(["get", "post", "put", "delete", "patch"]);

const slug = (method: string, path: string, opId?: string): string =>
	opId ??
	`${method}-${path}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const exampleFromSchema = (schema: unknown): unknown => {
	if (!schema || typeof schema !== "object") return undefined;
	const s = schema as Record<string, unknown>;
	if (s.example !== undefined) return s.example;
	if (s.default !== undefined) return s.default;
	if (Array.isArray(s.enum)) return s.enum[0];
	if (s.type === "object" && s.properties) {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(
			s.properties as Record<string, unknown>,
		)) {
			const ex = exampleFromSchema(v);
			if (ex !== undefined) out[k] = ex;
		}
		return Object.keys(out).length > 0 ? out : undefined;
	}
	if (s.type === "array" && s.items) {
		const ex = exampleFromSchema(s.items);
		return ex !== undefined ? [ex] : [];
	}
	if (s.type === "string") return "string";
	if (s.type === "number" || s.type === "integer") return 0;
	if (s.type === "boolean") return true;
	return undefined;
};

const jsonContent = (
	content: unknown,
): { example?: unknown; contentType?: string } => {
	if (!content || typeof content !== "object") return {};
	const record = content as Record<string, Record<string, unknown>>;
	const ct =
		Object.keys(record).find((k) => k.includes("json")) ??
		Object.keys(record)[0];
	if (!ct) return {};
	const media = record[ct];
	return {
		contentType: ct,
		example: media?.example ?? exampleFromSchema(media?.schema),
	};
};

/** Parse a spec object into endpoints grouped-ready ApiEndpoint[]. */
export function endpointsFromOpenApiSpec(
	spec: Record<string, unknown>,
	options?: { server?: string },
): ApiEndpoint[] {
	const paths = spec.paths as Record<string, unknown> | undefined;
	if (!paths || typeof paths !== "object") return [];

	const servers = spec.servers as { url?: string }[] | undefined;
	const defaultServer = options?.server ?? servers?.[0]?.url;

	const endpoints: ApiEndpoint[] = [];
	for (const [path, item] of Object.entries(paths)) {
		if (!item || typeof item !== "object") continue;
		for (const [method, operation] of Object.entries(
			item as Record<string, unknown>,
		)) {
			if (!METHODS.has(method) || !operation || typeof operation !== "object")
				continue;
			const op = operation as Record<string, unknown>;
			const tags = Array.isArray(op.tags) ? (op.tags as string[]) : [];
			const parameters: ApiParameter[] = Array.isArray(op.parameters)
				? op.parameters.map((p: Record<string, unknown>) => ({
						name: String(p.name ?? ""),
						in: (p.in as ApiParameter["in"]) ?? "query",
						required: Boolean(p.required),
						description:
							typeof p.description === "string" ? p.description : undefined,
						schema: p.schema,
						example: p.example ?? exampleFromSchema(p.schema),
					}))
				: [];

			const body = op.requestBody as Record<string, unknown> | undefined;
			const bodyContent = body ? jsonContent(body.content) : {};

			const responses: ApiEndpoint["responses"] = {};
			const resps = op.responses as Record<string, unknown> | undefined;
			if (resps) {
				for (const [code, r] of Object.entries(resps)) {
					const rec = r as Record<string, unknown>;
					responses[code] = {
						description:
							typeof rec.description === "string" ? rec.description : "",
						example: jsonContent(rec.content).example,
					};
				}
			}

			endpoints.push({
				id: slug(
					method,
					path,
					typeof op.operationId === "string" ? op.operationId : undefined,
				),
				method: method.toUpperCase() as HttpMethod,
				path,
				summary: typeof op.summary === "string" ? op.summary : undefined,
				description:
					typeof op.description === "string" ? op.description : undefined,
				tag: tags[0],
				parameters,
				requestBody: body
					? {
							description:
								typeof body.description === "string"
									? body.description
									: undefined,
							required: Boolean(body.required),
							example: bodyContent.example,
							contentType: bodyContent.contentType,
						}
					: undefined,
				responses,
				server: defaultServer,
			});
		}
	}
	return endpoints;
}

/** Load endpoints from a spec object, raw JSON/YAML text, or URL. */
export async function endpointsFromOpenApi(
	source: Record<string, unknown> | string,
	options?: { server?: string },
): Promise<ApiEndpoint[]> {
	let spec: Record<string, unknown>;
	if (typeof source === "object" && source !== null) {
		spec = source;
	} else {
		let text = source;
		if (/^https?:\/\//i.test(text) || /^\.?\//.test(text)) {
			const res = await fetch(text);
			if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);
			text = await res.text();
		}
		const trimmed = text.trim();
		spec = trimmed.startsWith("{")
			? JSON.parse(trimmed)
			: (load(trimmed, { schema: JSON_SCHEMA }) as Record<string, unknown>);
	}
	return endpointsFromOpenApiSpec(spec, options);
}
