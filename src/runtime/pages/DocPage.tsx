import { useParams } from "@tanstack/solid-router";
import { createResource, createSignal, Show } from "solid-js";
import { AskAiDialog } from "../components/AskAiDialog";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DocMarkdown } from "../components/DocMarkdown";
import { DocPrevNext } from "../components/DocPrevNext";
import { DocToc } from "../components/DocToc";
import { PageActions } from "../components/PageActions";
import { RelatedDocs } from "../components/RelatedDocs";
import { SkeletonPage } from "../components/Skeleton";
import { useDocs } from "../context";
import { createDocsList } from "../data";

function formatLastUpdated(iso?: string) {
	if (!iso) return "";
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return "";
	}
}

export function DocPage() {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const [askOpen, setAskOpen] = createSignal(false);
	const config = useDocs();
	const dataSource = useDocs().dataSource;
	const showBreadcrumbs = () => config.features?.breadcrumbs !== false;
	const showLastUpdated = () => config.features?.lastUpdated !== false;

	const [docs] = createDocsList(collection);
	const meta = () => (docs() ?? []).find((d) => d.id === docId());

	const [doc] = createResource(
		() => ({ collection: collection(), id: docId() }),
		async ({ collection, id }) => {
			if (!collection || !id) return { content: "" };
			return dataSource.get(collection, id);
		},
	);

	const frontmatter = () => doc()?.frontmatter;

	const pageLayout = () => frontmatter()?.layout ?? "doc";
	const showToc = () =>
		pageLayout() === "doc" &&
		frontmatter()?.toc !== false &&
		config.features?.toc !== false;
	const showAside = () =>
		pageLayout() === "doc" &&
		frontmatter()?.aside !== false &&
		config.features?.aside !== false;
	const showEditLink = () =>
		frontmatter()?.editLink !== false && config.features?.editLink !== false;

	return (
		<div class="flex gap-8 max-w-6xl mx-auto px-6 py-8">
			<article class="flex-1 min-w-0">
				<Show when={meta()}>
					{(m) => (
						<>
							<Show when={showBreadcrumbs() && pageLayout() === "doc"}>
								<Breadcrumbs
									collection={collection()}
									category={m().category}
									label={m().label}
								/>
							</Show>
							<div class="flex items-center gap-2 pb-4 mb-2 border-b border-border flex-wrap">
								<Show when={showEditLink()}>
									<PageActions
										collection={collection()}
										doc={m()}
										source={doc()?.content ?? ""}
									/>
								</Show>
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
							<Show when={showLastUpdated() && m().lastUpdated}>
								<div class="text-xs text-muted pb-4">
									Last updated: {formatLastUpdated(m().lastUpdated)}
								</div>
							</Show>
						</>
					)}
				</Show>
				<Show
					when={doc()}
					fallback={
						<Show when={doc.error} fallback={<SkeletonPage />}>
							<p class="text-muted text-sm">Failed to load document.</p>
						</Show>
					}
				>
					{(d) => <DocMarkdown source={d().content} />}
				</Show>
				<Show when={pageLayout() === "doc"}>
					<DocPrevNext
						collection={collection()}
						docs={docs() ?? []}
						currentId={docId()}
					/>
					<Show when={meta()}>
						{(m) => <RelatedDocs currentId={m().id} currentTags={m().tags} />}
					</Show>
				</Show>
			</article>
			<Show when={showAside()}>
				<aside class="hidden xl:block w-56 shrink-0">
					<div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
						<Show when={showToc() && doc()}>
							{(d) => <DocToc source={d().content} />}
						</Show>
					</div>
				</aside>
			</Show>
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
