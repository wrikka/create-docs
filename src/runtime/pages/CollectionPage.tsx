import { Link, useNavigate, useParams } from "@tanstack/solid-router";
import { createEffect, For, Show } from "solid-js";
import { createDocsList, useCollections } from "../data";
import { categoryIcon, typeIcon } from "../icons";

export function CollectionPage() {
	const params = useParams({ strict: false });
	const navigate = useNavigate();
	const collection = () => params().collection ?? "";
	const collections = useCollections();
	const meta = () => collections()?.find((c) => c.id === collection());
	const [docs] = createDocsList(collection);

	createEffect(() => {
		const list = docs() ?? [];
		if (meta() && !docs.loading && list.length > 0) {
			const first = list[0];
			if (first) {
				navigate({
					to: "/$collection/$docId",
					params: { collection: collection(), docId: first.id },
					replace: true,
				});
			}
		}
	});

	return (
		<div class="max-w-4xl mx-auto px-6 py-10">
			<Show
				when={meta()}
				fallback={
					<div class="flex flex-col items-center gap-3 py-20 text-muted">
						<span
							class="i-mdi:help-circle-outline text-4xl"
							aria-hidden="true"
						/>
						<h1 class="text-xl font-semibold text-foreground m-0">
							Unknown collection
						</h1>
						<p class="m-0">Select a collection from the dropdown above.</p>
					</div>
				}
			>
				{(m) => (
					<>
						<div class="flex items-center gap-3 mb-2">
							<span
								class={`${m().icon} text-3xl text-primary`}
								aria-hidden="true"
							/>
							<h1 class="text-2xl font-bold m-0">{m().label}</h1>
						</div>
						<p class="text-muted mt-0 mb-8">{m().description}</p>
						<Show
							when={docs.loading || (docs() ?? []).length > 0}
							fallback={
								<div class="flex flex-col items-center gap-3 py-16 rounded-lg border border-dashed border-border text-muted">
									<span
										class="i-mdi:package-variant-closed text-4xl"
										aria-hidden="true"
									/>
									<p class="m-0">No documentation yet — coming soon.</p>
								</div>
							}
						>
							<ul class="list-none m-0 p-0 grid gap-2 sm:grid-cols-2">
								<For each={docs()}>
									{(d) => (
										<li>
											<Link
												to="/$collection/$docId"
												params={{ collection: collection(), docId: d.id }}
												class="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface no-underline hover:border-focus transition-colors"
											>
												<span
													class={`${typeIcon(d.type)} text-muted`}
													aria-hidden="true"
												/>
												<span class="min-w-0">
													<span class="block text-sm font-medium text-foreground truncate">
														{d.label}
													</span>
													<span class="flex items-center gap-1 text-xs text-muted">
														<span
															class={categoryIcon(d.category)}
															aria-hidden="true"
														/>
														{d.category}
													</span>
												</span>
											</Link>
										</li>
									)}
								</For>
							</ul>
						</Show>
					</>
				)}
			</Show>
		</div>
	);
}
