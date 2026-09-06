import { createResource } from "solid-js";
import { useDocs } from "./context";
import type { CollectionMeta, DocEntry } from "./types";

/** Reactive collection list: dataSource collections merged with apiCollections. */
export function useCollections() {
	const config = useDocs();
	const [remote] = createResource(() => config.dataSource.collections());
	return (): CollectionMeta[] => [
		...(remote() ?? []),
		...(config.apiCollections ?? []),
	];
}

export function createDocsList(collection: () => string) {
	const config = useDocs();
	return createResource(collection, async (id) => {
		if (!id) return [] as DocEntry[];
		// API collections expose endpoints through the same list() shape.
		const api = (config.apiCollections ?? []).find((c) => c.id === id);
		if (api) {
			return api.endpoints.map(
				(e): DocEntry => ({
					id: e.id,
					label: e.summary ?? `${e.method} ${e.path}`,
					category: e.tag ?? "Endpoints",
					description: e.description ?? "",
					path: e.path,
					type: "api",
				}),
			);
		}
		return config.dataSource.list(id);
	});
}
