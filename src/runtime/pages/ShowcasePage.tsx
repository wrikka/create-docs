import { Link } from "@tanstack/solid-router";
import type { JSX } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { ShowcaseInfo } from "../config";
import { useDocs } from "../context";

function Card(props: {
	item: ShowcaseInfo;
	onDetails?: () => void;
	children: JSX.Element;
}) {
	const classes =
		"group border border-border rounded-xl overflow-hidden bg-surface/30 hover:border-focus transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col text-left";
	const { item } = props;
	if (item.collection && item.docId) {
		return (
			<Link
				to="/$collection/$docId"
				params={{ collection: item.collection, docId: item.docId }}
				class={`${classes} no-underline`}
			>
				{props.children}
			</Link>
		);
	}
	if (item.link?.startsWith("/")) {
		return (
			<Link to={item.link} class={`${classes} no-underline`}>
				{props.children}
			</Link>
		);
	}
	if (item.link) {
		return (
			<a
				href={item.link}
				target="_blank"
				rel="noreferrer"
				class={`${classes} no-underline`}
			>
				{props.children}
			</a>
		);
	}
	return (
		<button
			type="button"
			onClick={props.onDetails}
			class={`${classes} cursor-pointer bg-transparent p-0 font-inherit`}
		>
			{props.children}
		</button>
	);
}

function ShowcaseCard(props: { item: ShowcaseInfo; onDetails?: () => void }) {
	const { item } = props;
	const coverStyle = () => {
		if (item.image) return {};
		const color = item.coverColor ?? "hsl(var(--color-primary) / 0.35)";
		return {
			background: `linear-gradient(135deg, ${color}, transparent)`,
		};
	};

	return (
		<Card item={item} onDetails={props.onDetails}>
			<div
				class="relative h-44 w-full bg-background border-b border-border overflow-hidden"
				style={coverStyle()}
			>
				<Show
					when={item.image}
					fallback={
						<div class="w-full h-full flex items-center justify-center">
							<span
								class={`${item.icon ?? "i-mdi:view-dashboard"} text-6xl text-primary/60`}
								aria-hidden="true"
							/>
						</div>
					}
				>
					<img
						src={item.image!}
						alt={`${item.label} preview`}
						class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</Show>
				<Show when={item.badge}>
					<span class="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
						{item.badge}
					</span>
				</Show>
			</div>
			<div class="p-5 flex flex-col gap-2 flex-1">
				<div class="flex items-center gap-2">
					<Show when={item.icon && !item.image}>
						<span
							class={`${item.icon} text-xl text-primary`}
							aria-hidden="true"
						/>
					</Show>
					<h3 class="font-semibold text-base m-0">{item.label}</h3>
				</div>
				<p class="text-sm text-muted m-0 flex-1 leading-relaxed">
					{item.description}
				</p>
				<Show when={item.tags?.length}>
					<div class="flex flex-wrap gap-1.5 mt-1">
						<For each={item.tags}>
							{(tag) => (
								<span class="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted">
									{tag}
								</span>
							)}
						</For>
					</div>
				</Show>
			</div>
		</Card>
	);
}

export function ShowcasePage() {
	const config = useDocs();
	const allItems = () => config.showcase ?? [];
	const [search, setSearch] = createSignal("");
	const [tag, setTag] = createSignal<string | null>(null);
	const [detailItem, setDetailItem] = createSignal<ShowcaseInfo | null>(null);

	const allTags = createMemo(() => {
		const set = new Set<string>();
		for (const item of allItems()) {
			for (const t of item.tags ?? []) set.add(t);
		}
		return [...set].sort();
	});

	const filtered = createMemo(() => {
		const q = search().toLowerCase();
		const t = tag();
		return allItems().filter((item) => {
			const matchesSearch =
				!q ||
				item.label.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q) ||
				item.tags?.some((tg) => tg.toLowerCase().includes(q));
			const matchesTag = !t || item.tags?.includes(t);
			return matchesSearch && matchesTag;
		});
	});

	const featured = () => allItems()[0];
	const rest = () =>
		filtered().filter((i) => (featured() ? i.id !== featured()!.id : true));

	return (
		<div class="max-w-5xl mx-auto px-6 py-10 pb-24">
			<div class="flex items-start gap-3 mb-2">
				<span
					class="i-mdi:view-dashboard text-3xl text-primary"
					aria-hidden="true"
				/>
				<div>
					<h1 class="text-3xl font-bold m-0">Showcase</h1>
					<p class="text-muted m-0">
						Featured projects and examples built with this ecosystem.
					</p>
				</div>
			</div>

			<div class="flex flex-col sm:flex-row gap-3 my-8">
				<label class="flex items-center gap-2 flex-1 px-3 h-10 rounded-lg border border-border bg-surface text-muted text-sm">
					<span class="i-mdi:magnify" aria-hidden="true" />
					<input
						type="search"
						value={search()}
						onInput={(e) => setSearch(e.currentTarget.value)}
						placeholder="Filter showcase…"
						aria-label="Filter showcase"
						class="bg-transparent outline-none border-none w-full text-foreground placeholder:text-muted"
					/>
				</label>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setTag(null)}
						class={`px-3 h-9 rounded-full text-xs border transition-colors cursor-pointer ${
							tag() == null
								? "bg-primary text-primary-foreground border-primary"
								: "bg-surface text-muted border-border hover:border-focus"
						}`}
					>
						All
					</button>
					<For each={allTags()}>
						{(t) => (
							<button
								type="button"
								onClick={() => setTag(t)}
								class={`px-3 h-9 rounded-full text-xs border transition-colors cursor-pointer ${
									tag() === t
										? "bg-primary text-primary-foreground border-primary"
										: "bg-surface text-muted border-border hover:border-focus"
								}`}
							>
								{t}
							</button>
						)}
					</For>
				</div>
			</div>

			<Show when={!search() && !tag() && featured()}>
				<section class="mb-10">
					<h2 class="text-lg font-semibold mb-3 text-muted">Featured</h2>
					<div class="sm:max-w-2xl">
						<ShowcaseCard
							item={featured()!}
							onDetails={() => setDetailItem(featured()!)}
						/>
					</div>
				</section>
			</Show>

			<Show when={filtered().length === 0}>
				<div class="flex flex-col items-center gap-3 py-16 rounded-lg border border-dashed border-border text-muted">
					<span class="i-mdi:image-plus text-4xl" aria-hidden="true" />
					<p class="m-0">No showcase items match your filters.</p>
				</div>
			</Show>

			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<For each={rest()}>
					{(item) => (
						<ShowcaseCard item={item} onDetails={() => setDetailItem(item)} />
					)}
				</For>
			</div>

			<Show when={detailItem()}>
				{(item) => (
					<div
						class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
						onClick={() => setDetailItem(null)}
					>
						<div
							role="dialog"
							aria-modal="true"
							aria-label={item().label}
							class="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div class="relative h-40 bg-background border-b border-border flex items-center justify-center">
								<Show
									when={item().image}
									fallback={
										<span
											class={`${item().icon ?? "i-mdi:view-dashboard"} text-7xl text-primary/60`}
											aria-hidden="true"
										/>
									}
								>
									<img
										src={item().image!}
										alt={item().label}
										class="w-full h-full object-cover"
									/>
								</Show>
								<button
									type="button"
									onClick={() => setDetailItem(null)}
									aria-label="Close"
									class="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-md bg-surface/80 border border-border text-muted hover:text-foreground transition-colors cursor-pointer"
								>
									<span class="i-mdi:close" aria-hidden="true" />
								</button>
							</div>
							<div class="p-6">
								<div class="flex items-center gap-2 mb-2">
									<h3 class="text-xl font-semibold m-0">{item().label}</h3>
									<Show when={item().badge}>
										<span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
											{item().badge}
										</span>
									</Show>
								</div>
								<p class="text-sm text-muted leading-relaxed m-0">
									{item().description}
								</p>
								<Show when={item().tags?.length}>
									<div class="flex flex-wrap gap-1.5 mt-4">
										<For each={item().tags}>
											{(t) => (
												<span class="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-muted">
													{t}
												</span>
											)}
										</For>
									</div>
								</Show>
								<div class="flex items-center gap-2 mt-6">
									<Show when={item().link}>
										<a
											href={item().link}
											target="_blank"
											rel="noreferrer"
											class="px-4 h-9 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm no-underline hover:bg-primary-hover transition-colors"
										>
											<span class="i-mdi:open-in-new" aria-hidden="true" />
											Visit
										</a>
									</Show>
									<button
										type="button"
										onClick={() => setDetailItem(null)}
										class="px-4 h-9 inline-flex items-center rounded-md border border-border text-sm text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</Show>
		</div>
	);
}
