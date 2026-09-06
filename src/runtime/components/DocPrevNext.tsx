import { Link } from "@tanstack/solid-router";
import { Show } from "solid-js";
import type { DocEntry } from "../types";

export function DocPrevNext(props: {
	collection: string;
	docs: DocEntry[];
	currentId: string;
}) {
	const index = () => props.docs.findIndex((d) => d.id === props.currentId);
	const prev = () => (index() > 0 ? props.docs[index() - 1] : undefined);
	const next = () =>
		index() >= 0 && index() < props.docs.length - 1
			? props.docs[index() + 1]
			: undefined;

	return (
		<nav
			aria-label="Previous and next pages"
			class="flex items-stretch gap-3 mt-10 pt-6 border-t border-border"
		>
			<Show when={prev()}>
				{(p) => (
					<Link
						to="/$collection/$docId"
						params={{ collection: props.collection, docId: p().id }}
						class="flex-1 flex flex-col gap-1 p-3 rounded-lg border border-border no-underline hover:border-focus transition-colors"
					>
						<span class="flex items-center gap-1 text-xs text-muted">
							<span class="i-mdi:chevron-left" aria-hidden="true" />
							Previous
						</span>
						<span class="text-sm font-medium text-foreground">{p().label}</span>
					</Link>
				)}
			</Show>
			<Show when={next()}>
				{(n) => (
					<Link
						to="/$collection/$docId"
						params={{ collection: props.collection, docId: n().id }}
						class="flex-1 flex flex-col gap-1 p-3 rounded-lg border border-border no-underline text-right hover:border-focus transition-colors ml-auto"
					>
						<span class="flex items-center justify-end gap-1 text-xs text-muted">
							Next
							<span class="i-mdi:chevron-right" aria-hidden="true" />
						</span>
						<span class="text-sm font-medium text-foreground">{n().label}</span>
					</Link>
				)}
			</Show>
		</nav>
	);
}
