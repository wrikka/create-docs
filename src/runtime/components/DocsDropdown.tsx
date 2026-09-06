import { Link, useParams } from "@tanstack/solid-router";
import {
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { createDocsList, useCollections } from "../data";
import { categoryIcon } from "../icons";
import type { DocEntry } from "../types";

function sortDocs(items: DocEntry[]): DocEntry[] {
	return [...items].sort(
		(a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label),
	);
}

export function DocsDropdown() {
	const params = useParams({ strict: false });
	const [open, setOpen] = createSignal(false);
	const collections = useCollections();
	const [docs] = createDocsList(() => params().collection ?? "");
	let rootEl: HTMLDivElement | undefined;

	const current = () => params().collection;
	const currentMeta = () => collections()?.find((c) => c.id === current());

	const grouped = createMemo((): [string, DocEntry[]][] => {
		const groups = new Map<string, DocEntry[]>();
		for (const d of docs() ?? []) {
			const g = groups.get(d.category) ?? [];
			g.push(d);
			groups.set(d.category, g);
		}
		const entries = [...groups.entries()].map(
			([cat, items]) => [cat, sortDocs(items)] as [string, DocEntry[]],
		);
		const sections = currentMeta()?.sections;
		if (sections?.length) {
			const order = new Map<string, number>();
			sections.forEach((s, i) => {
				order.set(s.id, i);
				order.set(s.label, i);
			});
			return entries.sort(([a], [b]) => {
				const ia = order.get(a) ?? Number.MAX_SAFE_INTEGER;
				const ib = order.get(b) ?? Number.MAX_SAFE_INTEGER;
				return ia - ib || a.localeCompare(b);
			});
		}
		return entries.sort(([a], [b]) => a.localeCompare(b));
	});

	const onDocClick = (e: MouseEvent) => {
		if (rootEl && !rootEl.contains(e.target as Node)) setOpen(false);
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") setOpen(false);
	};

	onMount(() => {
		document.addEventListener("click", onDocClick);
		document.addEventListener("keydown", onKey);
	});
	onCleanup(() => {
		document.removeEventListener("click", onDocClick);
		document.removeEventListener("keydown", onKey);
	});

	return (
		<div ref={rootEl} class="relative">
			<button
				type="button"
				onClick={() => setOpen(!open())}
				aria-expanded={open()}
				aria-haspopup="menu"
				class={`px-3 h-9 inline-flex items-center gap-1.5 rounded-md text-sm no-underline transition-colors cursor-pointer border-none ${
					open() || current()
						? "bg-surface text-foreground"
						: "bg-transparent text-muted hover:text-foreground hover:bg-surface"
				}`}
			>
				<span class="i-mdi:book-open-page-variant" aria-hidden="true" />
				Docs
				<span
					class={`i-mdi:chevron-down text-xs text-muted transition-transform ${open() ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			<Show when={open()}>
				<div
					role="menu"
					aria-label="Documentation pages"
					class="absolute left-0 top-full mt-2 w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface shadow-xl z-50 overflow-hidden"
				>
					<div class="grid sm:grid-cols-[11rem_minmax(0,1fr)]">
						<div class="border-b sm:border-b-0 sm:border-r border-border bg-background/50 p-2">
							<div class="px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted">
								Collections
							</div>
							<ul class="list-none m-0 p-0">
								<For each={collections()}>
									{(c) => (
										<li>
											<Link
												to="/$collection"
												params={{ collection: c.id }}
												onClick={() => setOpen(false)}
												class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm no-underline transition-colors ${
													c.id === current()
														? "bg-primary/10 text-primary font-medium"
														: "text-muted hover:text-foreground hover:bg-surface"
												}`}
											>
												<Show when={c.icon}>
													<span
														class={`${c.icon} shrink-0`}
														aria-hidden="true"
													/>
												</Show>
												<span class="truncate">{c.label}</span>
											</Link>
										</li>
									)}
								</For>
							</ul>
						</div>
						<div class="max-h-80 overflow-y-auto p-2">
							<Show
								when={grouped().length > 0}
								fallback={
									<div class="px-3 py-6 text-sm text-muted text-center">
										{docs.loading
											? "Loading pages…"
											: "Select a collection to browse its pages."}
									</div>
								}
							>
								<For each={grouped()}>
									{([category, items]) => (
										<div class="mb-3 last:mb-0">
											<div class="flex items-center gap-1.5 px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted">
												<span
													class={categoryIcon(category)}
													aria-hidden="true"
												/>
												{category}
											</div>
											<ul class="list-none m-0 p-0">
												<For each={items}>
													{(d) => (
														<li>
															<Link
																to="/$collection/$docId"
																params={{
																	collection: params().collection ?? "",
																	docId: d.id,
																}}
																onClick={() => setOpen(false)}
																class={`block px-2 py-1.5 rounded-md text-sm no-underline transition-colors truncate ${
																	params().docId === d.id
																		? "bg-primary/10 text-primary font-medium"
																		: "text-muted hover:text-foreground hover:bg-background"
																}`}
															>
																{d.label}
															</Link>
														</li>
													)}
												</For>
											</ul>
										</div>
									)}
								</For>
							</Show>
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
}
