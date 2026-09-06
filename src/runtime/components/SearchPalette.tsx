import { useNavigate } from "@tanstack/solid-router";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { useDocs } from "../context";
import { searchDocs, useCollections } from "../data";

export const [searchOpen, setSearchOpen] = createSignal(false);

export function SearchPalette() {
	const navigate = useNavigate();
	const collections = useCollections();
	const config = useDocs();
	const [query, setQuery] = createSignal("");
	const [selected, setSelected] = createSignal(0);
	let inputEl: HTMLInputElement | undefined;

	const [results] = createResource(query, async (q) => {
		if (!q || q.trim().length < 2) return [];
		return searchDocs(config, q.trim());
	});

	createEffect(() => {
		if (searchOpen()) {
			setQuery("");
			setSelected(0);
			queueMicrotask(() => inputEl?.focus());
		}
	});

	const items = () => results() ?? [];

	const go = (index: number) => {
		const item = items()[index];
		if (!item) return;
		setSearchOpen(false);
		navigate({
			to: "/$collection/$docId",
			params: { collection: item.collection, docId: item.id },
		});
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
		if (e.key === "Enter") go(selected());
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
							placeholder="Search all documentation..."
							aria-label="Search documentation"
							class="flex-1 h-12 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted"
						/>
						<kbd class="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted">
							ESC
						</kbd>
					</div>
					<div class="max-h-80 overflow-y-auto">
						<Show when={results.loading}>
							<div class="px-4 py-6 text-sm text-muted text-center">
								Searching…
							</div>
						</Show>
						<Show
							when={
								!results.loading &&
								query().trim().length >= 2 &&
								items().length === 0
							}
						>
							<div class="px-4 py-6 text-sm text-muted text-center">
								No results for "{query()}"
							</div>
						</Show>
						<Show when={query().trim().length < 2}>
							<div class="px-4 py-6 text-sm text-muted text-center">
								Type at least 2 characters to search
							</div>
						</Show>
						<ul class="list-none m-0 p-1">
							<For each={items()}>
								{(item, i) => (
									<li>
										<button
											type="button"
											onClick={() => go(i())}
											onMouseEnter={() => setSelected(i())}
											class={`w-full text-left px-3 py-2 rounded-md cursor-pointer border-none transition-colors ${
												selected() === i() ? "bg-primary/10" : "bg-transparent"
											}`}
										>
											<div class="flex items-center gap-2">
												<span
													class="i-mdi:file-document-outline text-muted shrink-0"
													aria-hidden="true"
												/>
												<span class="text-sm font-medium text-foreground truncate">
													{item.title}
												</span>
												<span class="ml-auto text-[10px] uppercase tracking-wide text-muted shrink-0">
													{collectionLabel(item.collection)}
												</span>
											</div>
											<Show when={item.snippet}>
												<p class="text-xs text-muted m-0 mt-0.5 pl-6 truncate">
													{item.snippet}
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
