import { Link, useParams } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { useDocs } from "../context";
import { createDocsList, useCollections } from "../data";
import { categoryIcon, typeIcon } from "../icons";
import type { DocEntry } from "../types";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";

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
	const [menu, setMenu] = createSignal<{ x: number; y: number } | null>(null);
	const config = useDocs();
	const collections = useCollections();

	const href = () => `/${props.collection}/${props.doc.id}`;
	const absoluteUrl = () => `${location.origin}${href()}`;
	const repoUrl = () =>
		collections()?.find((c) => c.id === props.collection)?.repoUrl ??
		config.site.repoUrl;
	const editUrl = () =>
		repoUrl()
			? `${repoUrl()}/edit/${config.github?.branch ?? "main"}/${props.doc.path || `${props.collection}/${props.doc.id}.md`}`
			: "";

	const copy = (text: string) => {
		navigator.clipboard.writeText(text).catch(() => {});
	};

	const menuItems = (): ContextMenuItem[] => [
		{
			label: "Open",
			icon: "i-mdi:file-document-outline",
			action: () => {
				location.href = href();
			},
		},
		{
			label: "Open in new tab",
			icon: "i-mdi:open-in-new",
			action: () => window.open(href(), "_blank", "noopener"),
		},
		{
			label: "Copy link",
			icon: "i-mdi:link-variant",
			action: () => copy(absoluteUrl()),
			divider: true,
		},
		{
			label: "Copy path",
			icon: "i-mdi:file-path",
			action: () =>
				copy(props.doc.path || `${props.collection}/${props.doc.id}.md`),
		},
		...(props.doc.description
			? [
					{
						label: "Copy description",
						icon: "i-mdi:text",
						action: () => copy(props.doc.description ?? ""),
					},
				]
			: []),
		...(editUrl()
			? [
					{
						label: "Edit on GitHub",
						icon: "i-mdi:pencil-outline",
						action: () => window.open(editUrl(), "_blank", "noopener"),
						divider: true,
					},
				]
			: []),
	];

	return (
		<li>
			<div
				class="group/item flex items-center gap-0.5"
				onContextMenu={(e) => {
					e.preventDefault();
					setMenu({ x: e.clientX, y: e.clientY });
				}}
			>
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
						class={`${props.doc.icon ?? typeIcon(props.doc.type ?? "")} shrink-0 opacity-70`}
						aria-hidden="true"
					/>
					<span class="truncate">{props.doc.label}</span>
					<Show when={props.doc.badge}>
						<span class="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
							{props.doc.badge}
						</span>
					</Show>
				</Link>
				<button
					type="button"
					aria-label={`More actions for ${props.doc.label}`}
					title={props.doc.description || props.doc.label}
					onClick={(e) => {
						e.stopPropagation();
						const rect = e.currentTarget.getBoundingClientRect();
						setMenu({ x: rect.right, y: rect.bottom + 4 });
					}}
					class="w-6 h-6 shrink-0 inline-flex items-center justify-center rounded text-muted opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 hover:text-foreground hover:bg-surface transition-opacity cursor-pointer border-none bg-transparent"
				>
					<span class="i-mdi:dots-vertical" aria-hidden="true" />
				</button>
			</div>
			<ContextMenu
				open={menu() !== null}
				x={menu()?.x ?? 0}
				y={menu()?.y ?? 0}
				items={menuItems()}
				onClose={() => setMenu(null)}
			/>
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

function formatGroupLabel(category: string): string {
	if (!category || category === "Docs") return category || "Docs";
	return category
		.split(/[-_\s/]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export function SidebarNav(props: { open: boolean; onNavigate: () => void }) {
	const params = useParams({ strict: false });
	const config = useDocs();
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
		colMeta()?.sections?.find(
			(s) =>
				s.id === category ||
				s.label === category ||
				s.label === formatGroupLabel(category),
		);

	const groupLabel = (category: string) =>
		sectionMeta(category)?.label ?? formatGroupLabel(category);

	const resourceLinks = () => {
		const links: { label: string; to: string; icon: string }[] = [
			{ label: "Search", to: "/search", icon: "i-mdi:magnify" },
		];
		if (config.showcase?.length)
			links.push({
				label: "Showcase",
				to: "/showcase",
				icon: "i-mdi:view-dashboard",
			});
		if (config.plugins?.length)
			links.push({ label: "Plugins", to: "/plugins", icon: "i-mdi:puzzle" });
		if (config.features?.translate || config.translate)
			links.push({
				label: "Translate",
				to: "/translate",
				icon: "i-mdi:translate",
			});
		if (config.features?.analytics)
			links.push({
				label: "Analytics",
				to: "/analytics",
				icon: "i-mdi:chart-box-outline",
			});
		if (config.github?.releases)
			links.push({
				label: "Changelog",
				to: "/changelog",
				icon: "i-mdi:history",
			});
		if (config.github?.contributors)
			links.push({
				label: "Community",
				to: "/community",
				icon: "i-mdi:account-group",
			});
		if (config.github?.issues)
			links.push({
				label: "Issues",
				to: "/issues",
				icon: "i-mdi:alert-circle-outline",
			});
		if (config.apiDiff)
			links.push({
				label: "API diff",
				to: "/api-diff",
				icon: "i-mdi:file-compare",
			});
		return links;
	};

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
				(d.category ?? "").toLowerCase().includes(q) ||
				(d.description ?? "").toLowerCase().includes(q),
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
									{meta()?.label ?? groupLabel(category)}
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
				<Show when={resourceLinks().length > 0}>
					<div class="mt-6 pt-3 border-t border-border">
						<div class="flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-muted">
							<span class="i-mdi:apps" aria-hidden="true" />
							Resources
						</div>
						<ul class="list-none m-0 p-0">
							<For each={resourceLinks()}>
								{(link) => (
									<li>
										<Link
											to={link.to}
											onClick={props.onNavigate}
											class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm no-underline text-muted hover:text-foreground hover:bg-surface transition-colors"
										>
											<span
												class={`${link.icon} shrink-0 opacity-70`}
												aria-hidden="true"
											/>
											{link.label}
										</Link>
									</li>
								)}
							</For>
						</ul>
					</div>
				</Show>
			</nav>
		</aside>
	);
}
