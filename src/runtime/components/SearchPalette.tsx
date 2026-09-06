import { useNavigate, useParams } from "@tanstack/solid-router";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { useDocs } from "../context";
import { setTheme, useTheme } from "../theme";
import { searchDocs, useCollections } from "../data";

export const [searchOpen, setSearchOpen] = createSignal(false);

type SearchItem =
	| { type: "doc"; collection: string; id: string; title: string; snippet?: string }
	| { type: "cmd"; id: string; title: string; icon: string; run: () => void };

export function SearchPalette() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const collections = useCollections();
	const config = useDocs();
	const [query, setQuery] = createSignal("");
	const [selected, setSelected] = createSignal(0);
	const { theme } = useTheme();
	let inputEl: HTMLInputElement | undefined;

	const commands = (): SearchItem[] => [
		{
			type: "cmd",
			id: "home",
			title: "Go to home",
			icon: "i-mdi:home",
			run: () => navigate({ to: "/" }),
		},
		{
			type: "cmd",
			id: "theme",
			title: `Switch to ${theme() === "dark" ? "light" : "dark"} theme`,
			icon: "i-mdi:theme-light-dark",
			run: () => setTheme(theme() === "dark" ? "light" : "dark"),
		},
		{
			type: "cmd",
			id: "copy-url",
			title: "Copy page URL",
			icon: "i-mdi:link",
			run: () => navigator.clipboard.writeText(location.href),
		},
		{
			type: "cmd",
			id: "edit",
			title: "Edit this page",
			icon: "i-mdi:pencil-box",
			run: () =>
				navigate({
					to: "/edit/$collection/$docId",
					params: {
						collection: params().collection ?? "docs",
						docId: params().docId ?? "index",
					},
				}),
		},
		{
			type: "cmd",
			id: "github",
			title: "Open GitHub repository",
			icon: "i-mdi:github",
			run: () => window.open(config.site.repoUrl, "_blank"),
		},
	];

	const [results] = createResource(query, async (q) => {
		const term = q.trim();
		if (!term || term.length < 2) return [];
		return searchDocs(config, term);
	});

	const filteredCommands = (): SearchItem[] => {
		const q = query().trim().toLowerCase();
		if (!q) return commands();
		if (q.startsWith(">")) return commands().filter((c) => c.type === "cmd" && c.title.toLowerCase().includes(q.slice(1)));
		return commands().filter((c) => c.type === "cmd" && c.title.toLowerCase().includes(q));
	};

	const docItems = (): SearchItem[] =>
		(results() ?? []).map((r) => ({
			type: "doc",
			collection: r.collection,
			id: r.id,
			title: r.title,
			snippet: r.snippet,
		}));

	const items = (): SearchItem[] => {
		if (query().trim().length < 2) return filteredCommands();
		return [...filteredCommands(), ...docItems()];
	};

	createEffect(() => {
		if (searchOpen()) {
			setQuery("");
			setSelected(0);
			queueMicrotask(() => inputEl?.focus());
		}
	});

	const run = (index: number) => {
		const item = items()[index];
		if (!item) return;
		if (item.type === "cmd") {
			setSearchOpen(false);
			item.run();
		} else {
			setSearchOpen(false);
			navigate({
				to: "/$collection/$docId",
				params: { collection: item.collection, docId: item.id },
			});
		}
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") setSearchOpen(false);
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelected((i) => Math.min(i + 1, items().length - 1));
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelected((i) => Math.max(i - 1, 0));
		}
		if (e.key === "Enter") run(selected());
	};

	const collectionLabel = (id: string) =>
		collections()?.find((c) => c.id === id)?.label ?? id;

	return (
		<Show when={searchOpen()}>
			<div
				class="fixed inset-0 z-50 bg-overlay flex items-start justify-center pt-24 px-4"
				onClick={(e) => {
					if (e.target === e.currentTarget) setSearchOpen(false);
				}}
				onKeyDown={onKey}
				role="presentation"
			>
				<div class="w-full max-w-xl rounded-lg border border-border bg-surface shadow-2xl overflow-hidden">
					<div class="flex items-center gap-2 px-4 border-b border-border">
						<span class="i-mdi:magnify text-muted" aria-hidden="true" />
						<input
							ref={inputEl}
							type="text"
							value={query()}
							onInput={(e) => {
								setQuery(e.currentTarget.value);
								setSelected(0);
							}}
							placeholder="Search docs or type '>' for commands..."
							aria-label="Search documentation and commands"
							class="flex-1 h-12 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted"
						/>
						<kbd class="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted">
							ESC
						</kbd>
					</div>
					<div class="max-h-80 overflow-y-auto">
						<Show when={results.loading}>
							<div class="px-4 py-6 text-sm text-muted text-center">Searching…</div>
						</Show>
						<Show
							when={
								!results.loading &&
								query().trim().length >= 2 &&
								docItems().length === 0
							}
						>
							<div class="px-4 py-6 text-sm text-muted text-center">
								No document results for "{query()}"
							</div>
						</Show>
						<ul class="list-none m-0 p-1">
							<For each={items()}>
								{(item, i) => (
									<li>
										<button
											type="button"
											onClick={() => run(i())}
											onMouseEnter={() => setSelected(i())}
											class={`w-full text-left px-3 py-2 rounded-md cursor-pointer border-none transition-colors ${
												selected() === i() ? "bg-primary/10" : "bg-transparent"
											}`}
										>
											<div class="flex items-center gap-2">
												<span
													class={`${item.type === "cmd" ? item.icon : "i-mdi:file-document-outline"} text-muted shrink-0`}
													aria-hidden="true"
												/>
												<span class="text-sm font-medium text-foreground truncate">
													{item.title}
												</span>
												<Show when={item.type === "doc"}>
													<span class="ml-auto text-[10px] uppercase tracking-wide text-muted shrink-0">
														{item.type === "doc" && collectionLabel(item.collection)}
													</span>
												</Show>
											</div>
											<Show when={item.type === "doc" && item.snippet}>
												<p class="text-xs text-muted m-0 mt-0.5 pl-6 truncate">
													{item.type === "doc" && item.snippet}
												</p>
											</Show>
										</button>
									</li>
								)}
							</For>
						</ul>
					</div>
					<div class="flex items-center gap-3 px-4 py-2 border-t border-border text-[10px] text-muted">
						<span>
							<kbd class="px-1 rounded border border-border">↑↓</kbd> navigate
						</span>
						<span>
							<kbd class="px-1 rounded border border-border">↵</kbd> open
						</span>
						<span class="ml-auto">{items().length} results</span>
					</div>
				</div>
			</div>
		</Show>
	);
}
