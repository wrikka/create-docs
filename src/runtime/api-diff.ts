import type { ApiCollection } from "./config";
import type { ApiEndpoint } from "./types";

export interface EndpointChange {
	type: "added" | "removed" | "changed";
	collection: string;
	endpoint: ApiEndpoint;
	/** Human-readable descriptions of what changed. */
	changes: string[];
}

const key = (c: string, e: ApiEndpoint) => `${c}:${e.method} ${e.path}`;

function describeChanges(prev: ApiEndpoint, next: ApiEndpoint): string[] {
	const changes: string[] = [];

	if (prev.summary !== next.summary) changes.push("Summary updated");
	if (prev.description !== next.description)
		changes.push("Description updated");
	if (prev.tag !== next.tag) changes.push("Tag changed");

	const prevParams = new Map(
		(prev.parameters ?? []).map((p) => [`${p.in}:${p.name}`, p]),
	);
	const nextParams = new Map(
		(next.parameters ?? []).map((p) => [`${p.in}:${p.name}`, p]),
	);
	for (const [k, p] of nextParams) {
		const old = prevParams.get(k);
		if (!old) changes.push(`Parameter added: ${p.name} (${p.in})`);
		else if (old.required !== p.required)
			changes.push(
				`Parameter ${p.name} is now ${p.required ? "required" : "optional"}`,
			);
	}
	for (const [k, p] of prevParams) {
		if (!nextParams.has(k))
			changes.push(`Parameter removed: ${p.name} (${p.in})`);
	}

	if (
		(prev.requestBody?.required ?? false) !==
		(next.requestBody?.required ?? false)
	)
		changes.push(
			next.requestBody?.required
				? "Request body is now required"
				: "Request body is now optional",
		);

	const prevRes = new Set(Object.keys(prev.responses ?? {}));
	const nextRes = new Set(Object.keys(next.responses ?? {}));
	for (const s of nextRes) {
		if (!prevRes.has(s)) changes.push(`Response added: ${s}`);
	}
	for (const s of prevRes) {
		if (!nextRes.has(s)) changes.push(`Response removed: ${s}`);
	}

	return changes;
}

/**
 * Diff two API collection sets (previous vs current) by method+path.
 * Works uniformly for OpenAPI, oRPC, Elysia, and Nitro-derived collections
 * since all adapters normalise to {@link ApiCollection}.
 */
export function diffApiCollections(
	previous: ApiCollection[],
	current: ApiCollection[],
): EndpointChange[] {
	const prev = new Map<string, ApiEndpoint>();
	for (const c of previous) {
		for (const e of c.endpoints) prev.set(key(c.id, e), e);
	}
	const next = new Map<string, ApiEndpoint>();
	for (const c of current) {
		for (const e of c.endpoints) next.set(key(c.id, e), e);
	}

	const changes: EndpointChange[] = [];
	for (const [k, e] of next) {
		const col = k.slice(0, k.indexOf(":"));
		const old = prev.get(k);
		if (!old) {
			changes.push({
				type: "added",
				collection: col,
				endpoint: e,
				changes: [],
			});
			continue;
		}
		const diffs = describeChanges(old, e);
		if (diffs.length) {
			changes.push({
				type: "changed",
				collection: col,
				endpoint: e,
				changes: diffs,
			});
		}
	}
	for (const [k, e] of prev) {
		if (!next.has(k)) {
			changes.push({
				type: "removed",
				collection: k.slice(0, k.indexOf(":")),
				endpoint: e,
				changes: [],
			});
		}
	}
	return changes;
}
