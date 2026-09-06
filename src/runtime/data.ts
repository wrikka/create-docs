import MiniSearch from "minisearch";
import { createResource } from "solid-js";
import type { DocsAppConfig } from "./config";
import { useDocs } from "./context";
import type { CollectionMeta, DocEntry, SearchResult } from "./types";

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

interface SearchDoc extends SearchResult {
	content: string;
}

let cachedSearch: MiniSearch<SearchDoc> | undefined;

export async function buildSearchIndex(
	config: DocsAppConfig,
): Promise<MiniSearch<SearchDoc>> {
	if (cachedSearch) return cachedSearch;
	const collections = await config.dataSource.collections();
	const docs: SearchDoc[] = [];
	for (const collection of collections) {
		const entries = await config.dataSource.list(collection.id);
		for (const entry of entries) {
			const c = await config.dataSource.get(collection.id, entry.id);
			docs.push({
				collection: collection.id,
				id: entry.id,
				title: entry.label,
				snippet:
					entry.description || c.content.slice(0, 160).replace(/\s+/g, " "),
				score: 0,
				content: c.content,
			});
		}
	}

	cachedSearch = new MiniSearch<SearchDoc>({
		fields: ["title", "snippet", "content"],
		storeFields: ["collection", "id", "title", "snippet"],
		searchOptions: {
			prefix: true,
			fuzzy: 0.2,
		},
	});
	cachedSearch.addAll(docs);
	return cachedSearch;
}

export async function searchDocs(
	config: DocsAppConfig,
	query: string,
): Promise<SearchResult[]> {
	const index = await buildSearchIndex(config);
	const raw = index.search(query, { prefix: true, fuzzy: 0.2 });
	return raw.map((r) => ({
		collection: r.collection as string,
		id: r.id as string,
		title: r.title as string,
		snippet: r.snippet as string,
		score: r.score,
	}));
}
