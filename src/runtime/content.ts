import { type Type, type } from "arktype";
import { load as loadYaml } from "js-yaml";
import MiniSearch from "minisearch";
import type {
	CollectionMeta,
	DocContent,
	DocEntry,
	DocFrontmatter,
	DocQuery,
	DocsDataSource,
	SearchResult,
} from "./types";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Parse YAML frontmatter from raw markdown. Returns `{}` when absent. */
export function parseFrontmatter(raw: string): {
	data: DocFrontmatter;
	content: string;
} {
	const m = raw.match(FRONTMATTER_RE);
	if (!m) return { data: {}, content: raw };
	let data: DocFrontmatter = {};
	try {
		const parsed = loadYaml(m[1] ?? "");
		if (parsed && typeof parsed === "object") data = parsed as DocFrontmatter;
	} catch {
		// Malformed frontmatter — render the body anyway.
	}
	return { data, content: raw.slice(m[0].length) };
}

function isVisible(fm: DocFrontmatter, now: Date, includeDrafts: boolean) {
	if (includeDrafts) return true;
	if (fm.draft === true) return false;
	if (fm.publishedAt) {
		const t = Date.parse(fm.publishedAt);
		if (!Number.isNaN(t) && t > now.getTime()) return false;
	}
	return true;
}

function stripMarkdown(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[*_~|>-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function docIdFromPath(path: string): string {
	return path
		.replace(/^\.{0,2}\//, "")
		.replace(/\.(md|mdx)$/i, "")
		.replace(/[/\\]/g, "--");
}

/** Per-directory sidebar config from `_dir.yml` / `_dir.yaml`. */
export interface DirMeta {
	title?: string;
	icon?: string;
	order?: number;
	collapsed?: boolean;
}

interface LoadedDoc {
	entry: DocEntry;
	frontmatter: DocFrontmatter;
	content: string;
	dirKey: string;
}

/** Pure filter+sort — also usable by other data sources. */
export function queryDocs(entries: DocEntry[], q: DocQuery): DocEntry[] {
	let out = entries;
	if (q.where?.category) {
		out = out.filter((d) => d.category === q.where?.category);
	}
	if (q.where?.tag) {
		out = out.filter((d) => (d.tags ?? []).includes(q.where?.tag as string));
	}
	if (q.where?.draft !== undefined) {
		out = out.filter((d) => (d.draft ?? false) === q.where?.draft);
	}
	const dir = q.order === "desc" ? -1 : 1;
	const sorter: Record<
		NonNullable<DocQuery["sort"]>,
		(a: DocEntry, b: DocEntry) => number
	> = {
		title: (a, b) => a.label.localeCompare(b.label),
		order: (a, b) => (a.order ?? 0) - (b.order ?? 0),
		lastUpdated: (a, b) =>
			(a.lastUpdated ?? "").localeCompare(b.lastUpdated ?? ""),
		id: (a, b) => a.id.localeCompare(b.id),
	};
	if (q.sort)
		out = [...out].sort(
			(a, b) => sorter[q.sort as keyof typeof sorter](a, b) * dir,
		);
	if (q.limit && q.limit > 0) out = out.slice(0, q.limit);
	return out;
}

export interface StaticCollectionInput {
	meta: CollectionMeta;
	/**
	 * `import.meta.glob("…/docs/**\/*.{md,yml,yaml}", { query: "?raw", import: "default", eager: true })`
	 * Keys are file paths; values are raw file contents.
	 */
	files: Record<string, string>;
	/** Optional ArkType schema for frontmatter validation. */
	schema?: Type<DocFrontmatter, unknown>;
}

export interface StaticSourceOptions {
	collections: StaticCollectionInput[];
	/** Include `draft: true` / future `publishedAt` docs (e.g. in dev). */
	drafts?: boolean;
	/** Overrides "now" for scheduled publishing tests. */
	now?: Date;
}

/**
 * Nuxt Content-style filesystem data source driven by `import.meta.glob`.
 * Supports frontmatter, `_dir.yml` category config, draft/scheduled docs,
 * MiniSearch full-text search, and the `query()` API.
 */
export function createStaticDataSource(
	options: StaticSourceOptions,
): DocsDataSource {
	const now = options.now ?? new Date();
	const byCollection = new Map<string, LoadedDoc[]>();
	const dirMeta = new Map<string, Map<string, DirMeta>>();

	for (const col of options.collections) {
		const docs: LoadedDoc[] = [];
		const dirs = new Map<string, DirMeta>();

		const stripPrefix = `../${col.meta.id}/`;

		function normalizePath(p: string): string {
			let norm = p.replace(/\\/g, "/");
			if (norm.startsWith(stripPrefix)) {
				norm = norm.slice(stripPrefix.length);
			}
			return norm;
		}

		// First pass: collect _dir.yml metadata so titles apply to every doc.
		for (const [path, raw] of Object.entries(col.files)) {
			const norm = normalizePath(path);
			const parts = norm.split("/");
			const file = parts[parts.length - 1] ?? "";
			if (!/^_dir\.ya?ml$/i.test(file)) continue;
			try {
				dirs.set(
					parts.slice(0, -1).join("/"),
					(loadYaml(raw) ?? {}) as DirMeta,
				);
			} catch {
				// ignore malformed _dir.yml
			}
		}

		for (const [path, raw] of Object.entries(col.files)) {
			const norm = normalizePath(path);
			const parts = norm.split("/");
			const file = parts.pop() ?? "";
			const dirKey = parts.join("/");

			if (!/\.(md|mdx)$/i.test(file)) continue;

			const { data: fm, content } = parseFrontmatter(raw);
			if (col.schema) {
				const result = col.schema(fm);
				if (result instanceof type.errors) {
					throw new Error(
						`Frontmatter validation failed for ${norm}: ${result.summary}`,
					);
				}
			}
			const id = docIdFromPath(norm);
			const dirMetaForDoc = dirs.get(dirKey);
			const category =
				fm.category ??
				dirMetaForDoc?.title ??
				parts[parts.length - 1] ??
				"Docs";
			docs.push({
				entry: {
					id,
					label: fm.title ?? file.replace(/\.(md|mdx)$/i, ""),
					category,
					description: fm.description ?? "",
					path: norm,
					lastUpdated: fm.lastUpdated,
					publishedAt: fm.publishedAt,
					order: fm.order,
					tags: fm.tags,
					badge: fm.badge,
					icon: fm.icon,
					draft: fm.draft === true,
					seo: fm.seo,
					type: "md",
				},
				frontmatter: fm,
				content,
				dirKey,
			});
		}
		byCollection.set(col.meta.id, docs);
		dirMeta.set(col.meta.id, dirs);
	}

	const visible = (colId: string) =>
		(byCollection.get(colId) ?? []).filter((d) =>
			isVisible(d.frontmatter, now, options.drafts ?? false),
		);

	const sortEntries = (docs: LoadedDoc[]): LoadedDoc[] =>
		[...docs].sort(
			(a, b) =>
				(a.entry.order ?? Number.MAX_SAFE_INTEGER) -
					(b.entry.order ?? Number.MAX_SAFE_INTEGER) ||
				a.entry.label.localeCompare(b.entry.label),
		);

	// MiniSearch index over visible docs
	const mini = new MiniSearch<LoadedDoc>({
		fields: ["label", "description", "body"],
		storeFields: ["entry"],
	});
	const allDocs: (LoadedDoc & {
		collection: string;
		body: string;
		label: string;
		description: string;
	})[] = [];
	for (const col of options.collections) {
		for (const d of visible(col.meta.id)) {
			allDocs.push({
				...d,
				collection: col.meta.id,
				label: d.entry.label,
				description: d.entry.description,
				body: stripMarkdown(d.content).slice(0, 8000),
			});
		}
	}
	mini.addAll(
		allDocs.map((d) => ({ ...d, id: `${d.collection}::${d.entry.id}` })),
	);

	return {
		async collections(): Promise<CollectionMeta[]> {
			return options.collections.map((c) => {
				const dirs = dirMeta.get(c.meta.id);
				if (!dirs?.size) return c.meta;
				const sections = [...dirs.entries()]
					.map(([dirKey, m]) => ({
						id: dirKey.split("/").pop() ?? dirKey,
						label: m.title ?? dirKey.split("/").pop() ?? dirKey,
						icon: m.icon,
						order: m.order,
						collapsed: m.collapsed,
					}))
					.sort(
						(a, b) =>
							(a.order ?? Number.MAX_SAFE_INTEGER) -
							(b.order ?? Number.MAX_SAFE_INTEGER),
					);
				return { ...c.meta, sections };
			});
		},

		async list(collection: string): Promise<DocEntry[]> {
			return sortEntries(visible(collection)).map((d) => d.entry);
		},

		async get(collection: string, id: string): Promise<DocContent> {
			const doc = (byCollection.get(collection) ?? []).find(
				(d) => d.entry.id === id,
			);
			if (!doc) throw new Error(`Document not found: ${collection}/${id}`);
			if (!isVisible(doc.frontmatter, now, options.drafts ?? false)) {
				throw new Error(`Document is not published: ${id}`);
			}
			return { content: doc.content, frontmatter: doc.frontmatter };
		},

		async search(q: string, collection?: string): Promise<SearchResult[]> {
			return mini
				.search(q, { prefix: true, fuzzy: 0.2 })
				.filter((r) => {
					const doc = allDocs.find(
						(d) => `${d.collection}::${d.entry.id}` === r.id,
					);
					return doc && (!collection || doc.collection === collection);
				})
				.slice(0, 20)
				.map((r) => {
					const doc = allDocs.find(
						(d) => `${d.collection}::${d.entry.id}` === r.id,
					);
					return {
						collection: doc?.collection ?? "",
						id: doc?.entry.id ?? "",
						title: doc?.entry.label ?? "",
						snippet: doc?.body.slice(0, 160) ?? "",
						score: r.score,
					};
				});
		},

		async query(q: DocQuery): Promise<DocEntry[]> {
			const cols = q.collection
				? [q.collection]
				: options.collections.map((c) => c.meta.id);
			const entries = cols.flatMap((c) => visible(c).map((d) => d.entry));
			return queryDocs(entries, q);
		},
	};
}

export interface RemoteDataSourceOptions {
	baseUrl: string;
	/** Name of the collection this remote source serves. */
	collection: string;
	/** Optional fetch init options. */
	fetchOptions?: RequestInit;
}

export function createRemoteDataSource(
	options: RemoteDataSourceOptions,
): DocsDataSource {
	const manifestUrl = `${options.baseUrl.replace(/\/$/, "")}/manifest.json`;

	async function fetchJson<T>(url: string): Promise<T> {
		const res = await fetch(url, options.fetchOptions);
		if (!res.ok) throw new Error(`Remote fetch failed: ${res.status} ${url}`);
		return res.json() as Promise<T>;
	}

	let cachedList: DocEntry[] | undefined;
	let cachedMeta: CollectionMeta | undefined;

	return {
		async collections(): Promise<CollectionMeta[]> {
			if (cachedMeta) return [cachedMeta];
			const meta = await fetchJson<CollectionMeta>(manifestUrl);
			cachedMeta = { ...meta, id: options.collection };
			return [cachedMeta];
		},
		async list(): Promise<DocEntry[]> {
			if (cachedList) return cachedList;
			const list = await fetchJson<DocEntry[]>(
				`${options.baseUrl.replace(/\/$/, "")}/docs.json`,
			);
			cachedList = list;
			return list;
		},
		async get(collection: string, id: string): Promise<DocContent> {
			const url = `${options.baseUrl.replace(/\/$/, "")}/${collection}/${id}.json`;
			return fetchJson<DocContent>(url);
		},
		async search(): Promise<SearchResult[]> {
			return [];
		},
		async query(q: DocQuery): Promise<DocEntry[]> {
			const entries = await this.list(options.collection);
			return queryDocs(entries, q);
		},
	};
}

export function createCompositeDataSource(
	sources: DocsDataSource[],
): DocsDataSource {
	const cache = new Map<string, DocsDataSource>();
	async function sourceFor(collection: string) {
		if (cache.has(collection)) return cache.get(collection);
		for (const s of sources) {
			const cols = await s.collections();
			if (cols.some((c) => c.id === collection)) {
				cache.set(collection, s);
				return s;
			}
		}
		return undefined;
	}

	return {
		async collections(): Promise<CollectionMeta[]> {
			const all = await Promise.all(sources.map((s) => s.collections()));
			return all.flat();
		},
		async list(collection: string): Promise<DocEntry[]> {
			const s = await sourceFor(collection);
			if (!s) throw new Error(`No data source for collection: ${collection}`);
			return s.list(collection);
		},
		async get(collection: string, id: string): Promise<DocContent> {
			const s = await sourceFor(collection);
			if (!s) throw new Error(`No data source for collection: ${collection}`);
			return s.get(collection, id);
		},
		async search(q: string, collection?: string): Promise<SearchResult[]> {
			const results = await Promise.all(
				sources.map((s) => s.search(q, collection)),
			);
			return results.flat().slice(0, 20);
		},
		async query(q: DocQuery): Promise<DocEntry[]> {
			if (q.collection) {
				const s = await sourceFor(q.collection);
				if (!s)
					throw new Error(`No data source for collection: ${q.collection}`);
				return s.query ? s.query(q) : [];
			}
			const results = await Promise.all(
				sources.map((s) => (s.query ? s.query(q) : [])),
			);
			return results.flat();
		},
	};
}

/** Related docs: same collection sharing at least one tag. */
export function relatedDocs(
	entries: DocEntry[],
	current: DocEntry,
	limit = 4,
): DocEntry[] {
	const tags = new Set(current.tags ?? []);
	if (!tags.size) return [];
	return entries
		.filter(
			(d) => d.id !== current.id && (d.tags ?? []).some((t) => tags.has(t)),
		)
		.slice(0, limit);
}
