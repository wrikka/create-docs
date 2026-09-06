import { Link, useParams } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { ShowcaseCard } from "../components/ShowcaseCard";
import { SkeletonPage } from "../components/Skeleton";
import { createDocsList, useCollections } from "../data";
import { categoryIcon, typeIcon } from "../icons";

export function CollectionPage() {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const collections = useCollections();
	const meta = () => collections()?.find((c) => c.id === collection());
	const [docs] = createDocsList(collection);

	const isShowcase = () => collection() === "showcase";
	const isApi = () => meta()?.type === "api";

	return (
		<div class="max-w-6xl mx-auto px-6 py-10 pb-24">
			<Show when={docs.loading}>
				<SkeletonPage />
			</Show>

			<Show when={!docs.loading}>
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
								when={docs() && (docs() ?? []).length > 0}
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
								<Show when={isShowcase()}>
									<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										<For each={docs()}>
											{(d) => (
												<ShowcaseCard collection={collection()} doc={d} />
											)}
										</For>
									</div>
								</Show>

								<Show when={!isShowcase()}>
									<div
										class={`grid gap-3 ${
											isApi() ? "" : "sm:grid-cols-2 lg:grid-cols-3"
										}`}
									>
										<For each={docs()}>
											{(d) => (
												<Link
													to="/$collection/$docId"
													params={{
														collection: collection(),
														docId: d.id,
													}}
													class="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface/30 no-underline hover:border-focus transition-colors"
												>
													<span
														class={`${typeIcon(d.type ?? "")} text-2xl text-primary shrink-0`}
														aria-hidden="true"
													/>
													<div class="min-w-0 flex-1">
														<div class="flex items-center gap-2 mb-1">
															<span class="block text-sm font-medium text-foreground truncate">
																{d.label}
															</span>
															<Show when={d.badge}>
																<span class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
																	{d.badge}
																</span>
															</Show>
														</div>
														<Show when={d.description}>
															<p class="text-xs text-muted m-0 leading-relaxed line-clamp-2">
																{d.description}
															</p>
														</Show>
														<div class="flex items-center gap-1 text-[11px] text-muted mt-2">
															<span
																class={categoryIcon(d.category ?? "")}
																aria-hidden="true"
															/>
															{d.category}
															<Show when={d.tags?.length}>
																<span class="ml-auto flex gap-1">
																	<For each={d.tags!.slice(0, 3)}>
																		{(tag) => (
																			<span class="px-1.5 py-0.5 rounded bg-background border border-border text-muted">
																				{tag}
																			</span>
																		)}
																	</For>
																</span>
															</Show>
														</div>
													</div>
												</Link>
											)}
										</For>
									</div>
								</Show>
							</Show>
						</>
					)}
				</Show>
			</Show>
		</div>
	);
}
