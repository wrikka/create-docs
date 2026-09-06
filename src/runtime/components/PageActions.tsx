import { createSignal, Show } from "solid-js";
import { useCollections } from "../data";
import type { DocEntry } from "../types";

export function PageActions(props: {
	collection: string;
	doc: DocEntry;
	source: string;
}) {
	const [copied, setCopied] = createSignal(false);
	const collections = useCollections();

	const repoUrl = () =>
		collections()?.find((c) => c.id === props.collection)?.repoUrl;

	const copyMarkdown = async () => {
		try {
			await navigator.clipboard.writeText(props.source);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	};

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
				{copied() ? "Copied" : "Copy as Markdown"}
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
			<Show when={repoUrl()}>
				{(url) => (
					<a
						href={`${url()}/blob/main/${props.doc.path}`}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors no-underline"
					>
						<span class="i-mdi:github" aria-hidden="true" />
						View source
					</a>
				)}
			</Show>
		</div>
	);
}
