import { createSignal, Show } from "solid-js";
import { useDocs } from "../context";
import { useCollections } from "../data";
import type { DocEntry } from "../types";

export function PageActions(props: {
	collection: string;
	doc: DocEntry;
	source: string;
}) {
	const [copied, setCopied] = createSignal(false);
	const collections = useCollections();
	const config = useDocs();
	const branch = () => config.github?.branch ?? "main";
	const repoUrl = () => config.site.repoUrl;
	const collectionRepo = () =>
		collections()?.find((c) => c.id === props.collection)?.repoUrl;

	const effectiveRepo = () => collectionRepo() ?? repoUrl() ?? "";
	const gitPath = () =>
		props.doc.path || `${props.collection}/${props.doc.id}.md`;

	const copyMarkdown = async () => {
		try {
			await navigator.clipboard.writeText(props.source);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	};

	const editUrl = () => `${effectiveRepo()}/edit/${branch()}/${gitPath()}`;
	const viewUrl = () => `${effectiveRepo()}/blob/${branch()}/${gitPath()}`;
	const reportUrl = () =>
		`${effectiveRepo()}/issues/new?title=docs(${props.doc.id}): &body=Issue on page ${props.collection}/${props.doc.id}`;
	const prUrl = () =>
		`${effectiveRepo()}/compare/${branch()}?quick_pull=1&title=docs(${props.doc.id}): `;

	return (
		<div class="flex items-center gap-2 flex-wrap">
			<button
				type="button"
				onClick={copyMarkdown}
				class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer bg-transparent"
			>
				<span
					class={copied() ? "i-mdi:check text-success" : "i-mdi:content-copy"}
					aria-hidden="true"
				/>
				{copied() ? "Copied" : "Copy"}
			</button>
			<a
				href={`/docs/${props.collection}/${props.doc.id}.md`}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
			>
				<span class="i-mdi:language-markdown-outline" aria-hidden="true" />
				View .md
			</a>
			<Show when={effectiveRepo()}>
				<a
					href={editUrl()}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
				>
					<span class="i-mdi:pencil-outline" aria-hidden="true" />
					Edit
				</a>
				<a
					href={viewUrl()}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
				>
					<span class="i-mdi:github" aria-hidden="true" />
					Source
				</a>
				<Show when={config.features?.reportIssue !== false}>
					<a
						href={reportUrl()}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
					>
						<span class="i-mdi:alert-circle-outline" aria-hidden="true" />
						Report
					</a>
				</Show>
				<Show when={config.features?.openPR}>
					<a
						href={prUrl()}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
					>
						<span class="i-mdi:source-pull" aria-hidden="true" />
						PR
					</a>
				</Show>
			</Show>
		</div>
	);
}
