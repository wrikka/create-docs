import type { JSX } from "solid-js";
import { For, Show } from "solid-js";
import type { ShowcaseInfo } from "../config";
import { useDocs } from "../context";

function Card(props: { link?: string; children: JSX.Element }) {
	const classes =
		"group border border-border rounded-xl overflow-hidden bg-surface/30 hover:border-focus transition-colors flex flex-col";
	return props.link ? (
		<a href={props.link} target="_blank" rel="noreferrer" class={classes}>
			{props.children}
		</a>
	) : (
		<div class={classes}>{props.children}</div>
	);
}

function ShowcaseCard(props: { item: ShowcaseInfo }) {
	const { item } = props;
	return (
		<Card link={item.link}>
			<div class="relative h-40 w-full bg-background border-b border-border overflow-hidden">
				<Show
					when={item.image}
					fallback={
						<div class="w-full h-full flex items-center justify-center">
							<span
								class={`${item.icon ?? "i-mdi:view-dashboard"} text-5xl text-primary/60`}
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
	const items = () => config.showcase ?? [];

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

			<Show when={items().length === 0}>
				<div class="flex flex-col items-center gap-3 py-16 rounded-lg border border-dashed border-border text-muted">
					<span class="i-mdi:image-plus text-4xl" aria-hidden="true" />
					<p class="m-0">No showcase items configured yet.</p>
					<p class="text-sm m-0 max-w-md text-center">
						Add a `showcase` array to your docs config with cover images,
						descriptions, and links.
					</p>
				</div>
			</Show>

			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<For each={items()}>{(item) => <ShowcaseCard item={item} />}</For>
			</div>
		</div>
	);
}
