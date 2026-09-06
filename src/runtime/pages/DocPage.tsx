import { useParams } from "@tanstack/solid-router";
import { createResource, createSignal, Show } from "solid-js";
import { AskAiDialog } from "../components/AskAiDialog";
import { DocMarkdown } from "../components/DocMarkdown";
import { DocPrevNext } from "../components/DocPrevNext";
import { DocToc } from "../components/DocToc";
import { PageActions } from "../components/PageActions";
import { useDocs } from "../context";
import { createDocsList, useCollections } from "../data";

export function DocPage() {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const [askOpen, setAskOpen] = createSignal(false);
	const collections = useCollections();
	const dataSource = useDocs().dataSource;

	const [docs] = createDocsList(collection);
	const meta = () => (docs() ?? []).find((d) => d.id === docId());
	const collectionMeta = () =>
		collections()?.find((c) => c.id === collection());

	const [doc] = createResource(
		() => ({ collection: collection(), id: docId() }),
		async ({ collection, id }) => {
			if (!collection || !id) return { content: "" };
			return dataSource.get(collection, id);
		},
	);

	return (
		<div class="flex gap-8 max-w-6xl mx-auto px-6 py-8">
			<article class="flex-1 min-w-0">
				<Show when={meta()}>
					{(m) => (
						<>
							<div class="flex items-center gap-1.5 text-xs text-muted pb-3">
								<span
									class={collectionMeta()?.icon ?? "i-mdi:folder-outline"}
									aria-hidden="true"
								/>
								<span>{collectionMeta()?.label ?? collection()}</span>
								<span class="i-mdi:chevron-right" aria-hidden="true" />
								<span>{m().category}</span>
								<span class="i-mdi:chevron-right" aria-hidden="true" />
								<span class="text-foreground font-medium">{m().label}</span>
								<span
									class={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full border border-border text-[11px] uppercase tracking-wide ${
										m().type === "rust" ? "text-warning" : "text-accent"
									}`}
								>
									{m().type}
								</span>
							</div>
							<div class="flex items-center gap-2 pb-4 mb-2 border-b border-border flex-wrap">
								<PageActions
									collection={collection()}
									doc={m()}
									source={doc()?.content ?? ""}
								/>
								<button
									type="button"
									onClick={() => setAskOpen(true)}
									class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer bg-transparent"
								>
									<span class="i-mdi:robot-happy-outline" aria-hidden="true" />
									Ask AI
								</button>
								<span class="ml-auto inline-flex items-center gap-1.5 text-xs text-muted min-w-0">
									<span class="i-mdi:folder-open-outline" aria-hidden="true" />
									<code class="font-mono truncate">{m().path}</code>
								</span>
							</div>
						</>
					)}
				</Show>
				<Show
					when={doc()}
					fallback={
						<p class="text-muted text-sm">
							{doc.error ? "Failed to load document." : "Loading…"}
						</p>
					}
				>
					{(d) => <DocMarkdown source={d().content} />}
				</Show>
				<DocPrevNext
					collection={collection()}
					docs={docs() ?? []}
					currentId={docId()}
				/>
			</article>
			<aside class="hidden xl:block w-56 shrink-0">
				<div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
					<Show when={doc()}>{(d) => <DocToc source={d().content} />}</Show>
				</div>
			</aside>
			<AskAiDialog
				open={askOpen()}
				onClose={() => setAskOpen(false)}
				collection={collection()}
				docId={docId()}
				docTitle={meta()?.label ?? docId()}
			/>
		</div>
	);
}
