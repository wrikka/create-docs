/**
 * oRPC-native adapter: walk a router object and turn each procedure
 * into an ApiEndpoint for the reference + playground.
 *
 * oRPC HTTP default: POST /<basePath>/<dot.separated.path> with
 * `{ "json": <input> }` bodies (RPCHandler). Route metadata is read
 * defensively from `~orpc` so custom OpenAPIHandler routes work too.
 */

import type { ApiEndpoint, HttpMethod } from "../../runtime/types";

type UnknownRecord = Record<string, unknown>;

const asRecord = (v: unknown): UnknownRecord | undefined =>
	v && typeof v === "object" ? (v as UnknownRecord) : undefined;

const readRoute = (proc: unknown): UnknownRecord | undefined => {
	const meta = asRecord(asRecord(proc)?.["~orpc"]);
	if (!meta) return undefined;
	const direct = asRecord(meta.route);
	if (direct) return direct;
	const contract = asRecord(meta.procedureContract);
	return asRecord(asRecord(contract?.["~orpc"])?.route);
};

export interface OrpcAdapterOptions {
	/** e.g. "/rpc" — used when a procedure has no explicit route.path. */
	basePath?: string;
	/** Absolute server URL for the playground. Defaults to same-origin. */
	server?: string;
	/** Group all endpoints under this tag when no meta tags exist. */
	tag?: string;
}

export function endpointsFromOrpcRouter(
	router: unknown,
	options: OrpcAdapterOptions = {},
): ApiEndpoint[] {
	const basePath = options.basePath ?? "/rpc";
	const endpoints: ApiEndpoint[] = [];

	const walk = (node: unknown, keyPath: string[]) => {
		const rec = asRecord(node);
		if (!rec) return;

		const route = readRoute(node);
		if (route) {
			const method = (
				typeof route.method === "string" ? route.method : "POST"
			).toUpperCase() as HttpMethod;
			const dotPath = keyPath.join(".");
			const path =
				typeof route.path === "string" ? route.path : `${basePath}/${dotPath}`;
			const summary =
				(typeof route.summary === "string" && route.summary) || dotPath;
			endpoints.push({
				id: dotPath.replace(/[^a-zA-Z0-9]+/g, "-"),
				method,
				path,
				summary,
				description:
					typeof route.description === "string"
						? route.description
						: `oRPC procedure \`${dotPath}\`. Send input as \`{ "json": <input> }\`.`,
				tag: options.tag ?? keyPath[0],
				parameters: [],
				requestBody:
					method === "GET"
						? undefined
						: {
								required: false,
								contentType: "application/json",
								example: { json: {} },
							},
				responses: {
					"200": {
						description: "oRPC JSON response",
						example: { json: {} },
					},
				},
				server: options.server,
			});
			return;
		}

		for (const [key, value] of Object.entries(rec)) {
			if (key.startsWith("~") || key.startsWith("_")) continue;
			walk(value, [...keyPath, key]);
		}
	};

	walk(router, []);
	return endpoints;
}
