import { useNavigate, useSearch } from "@tanstack/solid-router";
import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { useDocs } from "../context";
import { searchDocs, useCollections } from "../data";
import type { SearchResult } from "../types";

/** Split text into highlighted parts matching any query term. */
function highlightParts(text: string, query: string) {
	const terms = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	if (!terms.length || !text) return [{ text, match: false }];
	const re = new RegExp(`(${terms.join("|")})`, "gi");
	const parts: { text: string; match: boolean }[] = [];
	let last = 0;
	for (const m of text.matchAll(re)) {
		const i = m.index ?? 0;
		if (i > last) parts.push({ text: text.slice(last, i), match: false });
		parts.push({ text: m[0], match: true });
		last = i + m[0].length;
	}
	if (last < text.length) parts.push({ text: text.slice(last), match: false });
	return parts;
}

function Highlighted(props: { text: string; query: string }) {
	return (
		<For each={highlightParts(props.text, props.query)}>
			{(p) =>
				p.match ? (
					<mark class="bg-warning/30 text-foreground rounded-sm px-0.5">
						{p.text}
					</mark>
				) : (
					p.text
				)
			}
		</For>
	);
}

function stripMarkdown(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, " [code block] ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^>\s?/gm, "")
		.replace(/[*_`~]/g, "")
		.trim();
}

/** Extract context windows around query matches in content. */
function matchExcerpts(content: string, query: string, max = 5): string[] {
	const terms = query.trim().split(/\s+/).filter(Boolean);
	if (!terms.length) return [];
	const plain = stripMarkdown(content);
	const re = new RegExp(
		`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
		"gi",
	);
	const excerpts: string[] = [];
	for (const m of plain.matchAll(re)) {
		const i = m.index ?? 0;
		const start = Math.max(0, i - 80);
		const end = Math.min(plain.length, i + m[0].length + 120);
		excerpts.push(
			`${start > 0 ? "…" : ""}${plain.slice(start, end)}${end < plain.length ? "…" : ""}`,
		);
		if (excerpts.length >= max) break;
	}
	return excerpts;
}

export function SearchPage() {
	const config = useDocs();
	const navigate = useNavigate();
	const collections = useCollections();
	const search = useSearch({ strict: false }) as () => { q?: string };
	const [query, setQuery] = createSignal(search().q ?? "");
	const [collection, setCollection] = createSignal<string | null>(null);
	const [selected, setSelected] = createSignal(0);

	const [results] = createResource(query, async (q) => {
		const term = q.trim();
		if (term.length < 2) return [] as SearchResult[];
		try {
			return await searchDocs(config, term);
		} catch {
			return [] as SearchResult[];
		}
	});

	const filtered = createMemo(() => {
		const c = collection();
		const list = results() ?? [];
		return c ? list.filter((r) => r.collection === c) : list;
	});

	const groups = createMemo((): [string, SearchResult[], number][] => {
		const map = new Map<string, SearchResult[]>();
		for (const r of filtered()) {
			const g = map.get(r.collection) ?? [];
			g.push(r);
			map.set(r.collection, g);
		}
		let offset = 0;
		return [...map.entries()].map(([col, items]) => {
			const entry: [string, SearchResult[], number] = [col, items, offset];
			offset += items.length;
			return entry;
		});
	});

	const flat = () => filtered();
	const current = () => flat()[selected()];

	const [preview] = createResource(
		() => {
			const r = current();
			return r ? { collection: r.collection, id: r.id } : null;
		},
		async (sel) => {
			try {
				const doc = await config.dataSource.get(sel.collection, sel.id);
				return doc.content ?? "";
			} catch {
				return "";
			}
		},
	);

	const collectionLabel = (id: string) =>
		collections()?.find((c) => c.id === id)?.label ?? id;

	const open = (r: SearchResult) => {
		navigate({
			to: "/$collection/$docId",
			params: { collection: r.collection, docId: r.id },
		});
	};

	createEffect(() => {
		setSelected(0);
	});

	const onKey = (e: KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelected((i) => Math.min(i + 1, flat().length - 1));
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelected((i) => Math.max(i - 1, 0));
		}
		if (e.key === "Enter" && current()) open(current()!);
	};

	return (
		<div class="max-w-7xl mx-auto px-6 py-8 pb-24" onKeyDown={onKey}>
			<div class="flex items-center gap-3 mb-6">
				<span class="i-mdi:magnify text-3xl text-primary" aria-hidden="true" />
				<div>
					<h1 class="text-2xl font-bold m-0">Search</h1>
					<p class="text-muted text-sm m-0">
						Full-text search across all collections.
					</p>
				</div>
			</div>

			<label class="flex items-center gap-2 px-4 h-12 rounded-xl border border-border bg-surface focus-within:border-focus transition-colors mb-4">
				<span class="i-mdi:magnify text-muted text-lg" aria-hidden="true" />
				<input
					ref={(el) => queueMicrotask(() => el.focus())}
					type="search"
					value={query()}
					onInput={(e) => setQuery(e.currentTarget.value)}
					placeholder="Search documentation…"
					aria-label="Search documentation"
					class="flex-1 bg-transparent outline-none border-none text-base text-foreground placeholder:text-muted"
				/>
				<Show when={query()}>
					<button
						type="button"
						onClick={() => setQuery("")}
						aria-label="Clear search"
						class="w-7 h-7 inline-flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer border-none bg-transparent"
					>
						<span class="i-mdi:close" aria-hidden="true" />
					</button>
				</Show>
			</label>

			<div class="flex flex-wrap items-center gap-2 mb-6">
				<button
					type="button"
					onClick={() => setCollection(null)}
					class={`px-3 h-8 rounded-full text-xs border transition-colors cursor-pointer ${
						collection() === null
							? "bg-primary text-primary-foreground border-primary"
							: "bg-surface text-muted border-border hover:border-focus"
					}`}
				>
					All
				</button>
				<For each={[...new Set((results() ?? []).map((r) => r.collection))]}>
					{(c) => (
						<button
							type="button"
							onClick={() => setCollection(c)}
							class={`px-3 h-8 rounded-full text-xs border transition-colors cursor-pointer ${
								collection() === c
									? "bg-primary text-primary-foreground border-primary"
									: "bg-surface text-muted border-border hover:border-focus"
							}`}
						>
							{collectionLabel(c)}
						</button>
					)}
				</For>
				<span class="ml-auto text-xs text-muted">
					{filtered().length} result{filtered().length === 1 ? "" : "s"}
				</span>
			</div>

			<Show
				when={query().trim().length >= 2}
				fallback={
					<div class="flex flex-col items-center gap-3 py-20 rounded-xl border border-dashed border-border text-muted">
						<span class="i-mdi:text-search text-5xl" aria-hidden="true" />
						<p class="m-0 text-sm">Type at least 2 characters to search.</p>
						<p class="m-0 text-xs">
							Use ↑↓ to navigate results, Enter to open, or press Ctrl K for the
							command palette.
						</p>
					</div>
				}
			>
				<div class="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
					{/* Results sidebar */}
					<aside class="rounded-xl border border-border bg-surface/30 overflow-hidden self-start max-h-[70vh] overflow-y-auto">
						<Show when={results.loading}>
							<div class="p-6 text-sm text-muted text-center">Searching…</div>
						</Show>
						<Show when={!results.loading && filtered().length === 0}>
							<div class="p-6 text-sm text-muted text-center">
								No results for "{query()}"
							</div>
						</Show>
						<For each={groups()}>
							{([col, items, start]) => {
								return (
									<div>
										<div class="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted border-b border-border bg-background/60 sticky top-0">
											{collectionLabel(col)}
											<span class="ml-1 font-normal">({items.length})</span>
										</div>
										<ul class="list-none m-0 p-1">
											<For each={items}>
												{(r, i) => {
													const idx = start + i();
													return (
														<li>
															<button
																type="button"
																onClick={() => setSelected(idx)}
																onDblClick={() => open(r)}
																class={`w-full text-left px-3 py-2.5 rounded-md cursor-pointer border-none transition-colors ${
																	selected() === idx
																		? "bg-primary/10"
																		: "bg-transparent hover:bg-surface"
																}`}
															>
																<div class="text-sm font-medium text-foreground truncate">
																	<Highlighted text={r.title} query={query()} />
																</div>
																<Show when={r.snippet}>
																	<p class="text-xs text-muted m-0 mt-0.5 line-clamp-2">
																		<Highlighted
																			text={r.snippet}
																			query={query()}
																		/>
																	</p>
																</Show>
															</button>
														</li>
													);
												}}
											</For>
										</ul>
									</div>
								);
							}}
						</For>
					</aside>

					{/* Content preview with highlights */}
					<section class="rounded-xl border border-border bg-surface/30 min-h-64 max-h-[70vh] overflow-y-auto">
						<Show
							when={current()}
							fallback={
								<div class="flex flex-col items-center gap-2 p-10 text-muted text-sm">
									<span
										class="i-mdi:file-search-outline text-4xl"
										aria-hidden="true"
									/>
									Select a result to preview matching content.
								</div>
							}
						>
							{(r) => (
								<div class="p-5">
									<div class="flex items-start gap-3 pb-4 mb-4 border-b border-border">
										<div class="min-w-0 flex-1">
											<div class="text-[10px] uppercase tracking-wide text-muted mb-1">
												{collectionLabel(r().collection)}
											</div>
											<h2 class="text-lg font-semibold text-foreground m-0">
												<Highlighted text={r().title} query={query()} />
											</h2>
										</div>
										<button
											type="button"
											onClick={() => open(r())}
											class="px-3 h-9 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
										>
											Open page
											<span class="i-mdi:arrow-right" aria-hidden="true" />
										</button>
									</div>
									<Show
										when={!preview.loading}
										fallback={
											<p class="text-sm text-muted">Loading preview…</p>
										}
									>
										<Show
											when={matchExcerpts(preview() ?? "", query()).length}
											fallback={
												<p class="text-sm text-muted leading-relaxed whitespace-pre-wrap m-0">
													{stripMarkdown(preview() ?? "").slice(0, 800) ||
														"No preview available."}
												</p>
											}
										>
											<div class="flex flex-col gap-3">
												<For each={matchExcerpts(preview() ?? "", query())}>
													{(ex) => (
														<p class="text-sm text-foreground/90 leading-relaxed m-0 p-3 rounded-lg bg-background/60 border border-border/60">
															<Highlighted text={ex} query={query()} />
														</p>
													)}
												</For>
											</div>
										</Show>
									</Show>
								</div>
							)}
						</Show>
					</section>
				</div>
			</Show>
		</div>
	);
}
