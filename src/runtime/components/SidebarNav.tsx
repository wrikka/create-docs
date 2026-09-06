import { Link, useParams } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { createDocsList } from "../data";
import { categoryIcon, typeIcon } from "../icons";

export function SidebarNav(props: { open: boolean; onNavigate: () => void }) {
	const params = useParams({ strict: false });
	const [search, setSearch] = createSignal("");
	const [docs] = createDocsList(() => params().collection);

	const grouped = createMemo(() => {
		const q = search().toLowerCase();
		const list = (docs() ?? []).filter(
			(d) =>
				!q ||
				d.label.toLowerCase().includes(q) ||
				d.category.toLowerCase().includes(q) ||
				d.description.toLowerCase().includes(q),
		);
		const groups = new Map<string, typeof list>();
		for (const d of list) {
			const g = groups.get(d.category) ?? [];
			g.push(d);
			groups.set(d.category, g);
		}
		return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
	});

	return (
		<aside
			class={`fixed lg:sticky top-14 bottom-0 left-0 z-30 w-72 shrink-0 border-r border-border bg-background overflow-y-auto transition-transform lg:translate-x-0 ${props.open ? "translate-x-0" : "-translate-x-full"}`}
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
					{([category, items]) => (
						<div class="mb-4">
							<div class="flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider font-semibold text-muted">
								<span class={categoryIcon(category)} aria-hidden="true" />
								{category}
								<span class="ml-auto font-normal">{items.length}</span>
							</div>
							<ul class="list-none m-0 p-0">
								<For each={items}>
									{(d) => {
										const isActive = () => params().docId === d.id;
										return (
											<li>
												<Link
													to="/$collection/$docId"
													params={{
														collection: params().collection ?? "",
														docId: d.id,
													}}
													onClick={props.onNavigate}
													aria-current={isActive() ? "page" : undefined}
													class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm no-underline transition-colors ${
														isActive()
															? "bg-primary/10 text-primary font-medium"
															: "text-muted hover:text-foreground hover:bg-surface"
													}`}
												>
													<span
														class={`${typeIcon(d.type)} shrink-0 opacity-70`}
														aria-hidden="true"
													/>
													<span class="truncate">{d.label}</span>
												</Link>
											</li>
										);
									}}
								</For>
							</ul>
						</div>
					)}
				</For>
			</nav>
		</aside>
	);
}
