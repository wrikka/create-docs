import { Link, useParams } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { relatedDocs } from "../content";
import { createDocsList } from "../data";

export function RelatedDocs(props: {
	currentId: string;
	currentTags?: string[];
}) {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const [docs] = createDocsList(collection);

	const related = () => {
		const list = docs() ?? [];
		const current = list.find((d) => d.id === props.currentId);
		if (!current) return [];
		return relatedDocs(list, current, 4);
	};

	return (
		<Show when={related().length > 0}>
			<div class="border-t border-border pt-6 mt-10">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
					Related docs
				</h3>
				<ul class="grid gap-2 sm:grid-cols-2">
					<For each={related()}>
						{(doc) => (
							<li>
								<Link
									to="/$collection/$docId"
									params={{ collection: collection(), docId: doc.id }}
									class="block p-3 rounded-md border border-border bg-surface hover:border-focus transition-colors no-underline text-sm text-foreground"
								>
									<div class="font-medium">{doc.label}</div>
									<Show when={doc.description}>
										<div class="text-xs text-muted truncate">
											{doc.description}
										</div>
									</Show>
								</Link>
							</li>
						)}
					</For>
				</ul>
			</div>
		</Show>
	);
}
