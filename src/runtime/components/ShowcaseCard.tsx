import { Link } from "@tanstack/solid-router";
import { createResource, For, Show } from "solid-js";
import { useDocs } from "../context";
import type { DocEntry } from "../types";

function makePreview(content: string, length = 140) {
	const text = content
		.replace(/<[^>]+>/g, " ")
		.replace(/[#*_`[\]()]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function ShowcaseCard(props: { collection: string; doc: DocEntry }) {
	const config = useDocs();
	const [detail] = createResource(
		() => ({ collection: props.collection, id: props.doc.id }),
		async ({ collection, id }) => config.dataSource.get(collection, id),
	);

	const preview = () => {
		if (props.doc.description) return props.doc.description;
		const d = detail();
		return d ? makePreview(d.content) : "";
	};

	const image = () => detail()?.frontmatter?.seo?.image;
	const tags = () =>
		(props.doc.tags?.length ? props.doc.tags : detail()?.frontmatter?.tags) ??
		[];

	return (
		<Link
			to="/$collection/$docId"
			params={{ collection: props.collection, docId: props.doc.id }}
			class="group flex flex-col border border-border rounded-xl bg-surface/30 overflow-hidden no-underline hover:border-focus transition-colors"
		>
			<div class="h-40 bg-surface border-b border-border flex items-center justify-center overflow-hidden relative">
				<Show
					when={image()}
					fallback={
						<span
							class={`${props.doc.icon ?? "i-mdi:view-dashboard"} text-5xl text-primary/60 group-hover:text-primary transition-colors`}
							aria-hidden="true"
						/>
					}
				>
					{(src) => (
						<img
							src={src() as string}
							alt={props.doc.label}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform"
							loading="lazy"
						/>
					)}
				</Show>
			</div>
			<div class="p-5 flex flex-col flex-1">
				<div class="flex items-center gap-2 mb-2">
					<h2 class="font-semibold text-foreground m-0 flex-1 min-w-0 truncate">
						{props.doc.label}
					</h2>
					<Show when={props.doc.badge}>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
							{props.doc.badge}
						</span>
					</Show>
				</div>
				<p class="text-sm text-muted m-0 mb-3 flex-1 leading-relaxed">
					{preview()}
				</p>
				<Show when={tags().length > 0}>
					<div class="flex flex-wrap gap-1 mt-auto">
						<For each={tags().slice(0, 4)}>
							{(tag) => (
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted">
									{tag}
								</span>
							)}
						</For>
					</div>
				</Show>
			</div>
		</Link>
	);
}
