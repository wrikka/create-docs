import { Link, useParams } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { createDocsList, useCollections } from "../data";
import { categoryIcon, typeIcon } from "../icons";
import type { DocEntry } from "../types";

function sortDocs(items: DocEntry[]): DocEntry[] {
	return [...items].sort(
		(a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label),
	);
}

function SidebarDocItem(props: {
	doc: DocEntry;
	collection: string;
	activeId?: string;
	depth?: number;
	onNavigate: () => void;
}) {
	const depth = () => props.depth ?? 0;
	const isActive = () => props.activeId === props.doc.id;
	const hasChildren = () => (props.doc.children?.length ?? 0) > 0;
	const [open, setOpen] = createSignal(true);

	return (
		<li>
			<div class="flex items-center gap-0.5">
				<Show when={hasChildren()}>
					<button
						type="button"
						onClick={() => setOpen(!open())}
						aria-label={open() ? "Collapse section" : "Expand section"}
						aria-expanded={open()}
						class="w-5 h-5 shrink-0 inline-flex items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer border-none bg-transparent"
					>
						<span
							class={`i-mdi:chevron-down text-xs transition-transform ${open() ? "" : "-rotate-90"}`}
							aria-hidden="true"
						/>
					</button>
				</Show>
				<Link
					to="/$collection/$docId"
					params={{
						collection: props.collection,
						docId: props.doc.id,
					}}
					onClick={props.onNavigate}
					aria-current={isActive() ? "page" : undefined}
					style={{ "padding-left": `${0.5 + depth() * 0.75}rem` }}
					class={`flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm no-underline transition-colors ${
						isActive()
							? "bg-primary/10 text-primary font-medium"
							: "text-muted hover:text-foreground hover:bg-surface"
					}`}
				>
					<span
						class={`${props.doc.icon ?? typeIcon(props.doc.type)} shrink-0 opacity-70`}
						aria-hidden="true"
					/>
					<span class="truncate">{props.doc.label}</span>
					<Show when={props.doc.badge}>
						<span class="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
							{props.doc.badge}
						</span>
					</Show>
				</Link>
			</div>
			<Show when={hasChildren() && open()}>
				<ul class="list-none m-0 p-0 ml-2.5 border-l border-border/60">
					<For each={sortDocs(props.doc.children ?? [])}>
						{(child) => (
							<SidebarDocItem
								doc={child}
								collection={props.collection}
								activeId={props.activeId}
								depth={depth() + 1}
								onNavigate={props.onNavigate}
							/>
						)}
					</For>
				</ul>
			</Show>
		</li>
	);
}

export function SidebarNav(props: { open: boolean; onNavigate: () => void }) {
	const params = useParams({ strict: false });
	const [search, setSearch] = createSignal("");
	const [docs] = createDocsList(() => params().collection);
	const collections = useCollections();
	const colMeta = () =>
		collections()?.find((c) => c.id === params().collection);

	const [collapsed, setCollapsed] = createSignal<Record<string, boolean>>({});
	const storageKey = () =>
		`create-docs:sidebar:${params().collection ?? "default"}`;

	createEffect(() => {
		storageKey();
		try {
			const raw = localStorage.getItem(storageKey());
			setCollapsed(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
		} catch {
			setCollapsed({});
		}
	});

	const sectionMeta = (category: string) =>
		colMeta()?.sections?.find((s) => s.id === category || s.label === category);

	const isCollapsed = (category: string) => {
		const stored = collapsed()[category];
		if (stored !== undefined) return stored;
		return sectionMeta(category)?.collapsed ?? false;
	};

	const toggleGroup = (category: string) => {
		const next = {
			...collapsed(),
			[category]: !isCollapsed(category),
		};
		setCollapsed(next);
		try {
			localStorage.setItem(storageKey(), JSON.stringify(next));
		} catch {
			// storage unavailable — state not persisted
		}
	};

	const grouped = createMemo((): [string, DocEntry[]][] => {
		const q = search().toLowerCase();
		const list = (docs() ?? []).filter(
			(d) =>
				!q ||
				d.label.toLowerCase().includes(q) ||
				d.category.toLowerCase().includes(q) ||
				d.description.toLowerCase().includes(q),
		);
		const groups = new Map<string, DocEntry[]>();
		for (const d of list) {
			const g = groups.get(d.category) ?? [];
			g.push(d);
			groups.set(d.category, g);
		}
		const entries = [...groups.entries()].map(
			([cat, items]) => [cat, sortDocs(items)] as [string, DocEntry[]],
		);
		const sections = colMeta()?.sections;
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

	return (
		<aside
			class={`fixed top-[var(--docs-banner-height,0px)] bottom-0 right-0 z-30 w-72 h-[calc(100vh-var(--docs-banner-height,0px))] shrink-0 border-l border-border bg-background overflow-y-auto transition-transform ${props.open ? "translate-x-0" : "translate-x-full"} lg:left-0 lg:right-auto lg:border-l-0 lg:border-r lg:border-r-border lg:translate-x-0 lg:top-[calc(3.5rem+var(--docs-banner-height,0px))] lg:h-[calc(100vh-3.5rem-var(--docs-banner-height,0px))]`}
		>
			<div class="p-3 sticky top-0 bg-background z-10 border-b border-border">
				<label class="flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface text-muted text-sm">
					<span class="i-mdi:magnify" aria-hidden="true" />
					<input
						type="search"
						value={search()}
						onInput={(e) => setSearch(e.currentTarget.value)}
						placeholder="Filter docs..."
						aria-label="Filter docs"
						class="bg-transparent outline-none border-none w-full text-foreground placeholder:text-muted"
					/>
				</label>
			</div>
			<nav class="p-3 pt-2" aria-label="Documentation">
				<Show when={!docs.loading && grouped().length === 0}>
					<div class="flex flex-col items-center gap-2 py-10 text-muted text-sm">
						<span
							class="i-mdi:file-document-outline text-3xl"
							aria-hidden="true"
						/>
						No docs found
					</div>
				</Show>
				<For each={grouped()}>
					{([category, items]) => {
						const meta = () => sectionMeta(category);
						const collapsedNow = () => isCollapsed(category);
						return (
							<div class="mb-4">
								<button
									type="button"
									onClick={() => toggleGroup(category)}
									aria-expanded={!collapsedNow()}
									class="w-full flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-muted hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
								>
									<span
										class={meta()?.icon ?? categoryIcon(category)}
										aria-hidden="true"
									/>
									{meta()?.label ?? category}
									<span class="ml-auto font-normal">{items.length}</span>
									<span
										class={`i-mdi:chevron-down text-xs transition-transform ${collapsedNow() ? "-rotate-90" : ""}`}
										aria-hidden="true"
									/>
								</button>
								<Show when={!collapsedNow()}>
									<ul class="list-none m-0 p-0">
										<For each={items}>
											{(d) => (
												<SidebarDocItem
													doc={d}
													collection={params().collection ?? ""}
													activeId={params().docId}
													onNavigate={props.onNavigate}
												/>
											)}
										</For>
									</ul>
								</Show>
							</div>
						);
					}}
				</For>
			</nav>
		</aside>
	);
}
