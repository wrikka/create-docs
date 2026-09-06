import { useParams } from "@tanstack/solid-router";
import { createResource, createSignal, Show } from "solid-js";
import { DocMarkdown } from "../components/DocMarkdown";
import { getGitHubToken } from "../components/GitHubAuth";
import { useDocs } from "../context";
import { useCollections } from "../data";

function repoInfo(url?: string) {
	if (!url) return null;
	const match = url.match(/github\.com[:/]([^/]+)\/([^/]+)/);
	if (!match) return null;
	return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function stringifyFrontmatter(fm: Record<string, unknown>): string {
	const lines = ["---"];
	for (const [k, v] of Object.entries(fm)) {
		if (Array.isArray(v)) {
			lines.push(`${k}:`);
			for (const item of v) lines.push(`  - ${item}`);
		} else if (typeof v === "boolean" || typeof v === "number") {
			lines.push(`${k}: ${v}`);
		} else {
			lines.push(`${k}: ${v}`);
		}
	}
	lines.push("---");
	return lines.join("\n");
}

export function EditPage() {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const config = useDocs();
	const dataSource = config.dataSource;
	const collections = useCollections();
	const colMeta = () => collections()?.find((c) => c.id === collection());

	const [doc] = createResource(
		() => ({ collection: collection(), id: docId() }),
		async ({ collection, id }) => {
			if (!collection || !id) return { content: "", frontmatter: {} };
			return dataSource.get(collection, id);
		},
	);

	const [source, setSource] = createSignal("");
	const [message, setMessage] = createSignal("");
	const [showPreview, setShowPreview] = createSignal(true);

	const fullSource = () => {
		const d = doc();
		if (!d) return "";
		const fm = d.frontmatter;
		if (!fm || Object.keys(fm).length === 0) return d.content;
		return `${stringifyFrontmatter(fm)}\n${d.content}`;
	};

	createResource(
		() => doc(),
		(d) => {
			if (d) setSource(fullSource());
		},
	);

	const handleDownload = () => {
		const blob = new Blob([source()], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${docId()}.md`;
		a.click();
		URL.revokeObjectURL(url);
		setMessage("Downloaded .md");
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(source());
			setMessage("Copied .md to clipboard");
		} catch {
			setMessage("Copy failed");
		}
	};

	const handleSave = async () => {
		const repo = config.site.repoUrl ? repoInfo(config.site.repoUrl) : null;
		if (!repo) {
			setMessage("GitHub repo not configured");
			return;
		}
		const filePath = doc()?.path;
		if (!filePath) {
			setMessage("Document path unknown");
			return;
		}
		try {
			const userToken = getGitHubToken();
			const res = await fetch("/api/content/save", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
				},
				body: JSON.stringify({
					...repo,
					path: `apps/web/create-docs/${collection()}/${filePath}`,
					content: source(),
					message: `docs: update ${collection()}/${docId()} [via create-docs editor]`,
					branch: config.github?.branch ?? "main",
					owner: repo.owner,
					repo: repo.repo,
				}),
			});
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (!res.ok) throw new Error(data.error ?? "Save failed");
			setMessage("Saved to GitHub");
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Save failed");
		}
	};

	const canSave = () => !!config.site.repoUrl;

	return (
		<div class="max-w-6xl mx-auto px-6 py-8">
			<div class="flex items-center gap-3 mb-6 flex-wrap">
				<h1 class="text-xl font-semibold text-foreground">
					Edit: {collection()}/{docId()}
				</h1>
				<span class="text-sm text-muted">{colMeta()?.label}</span>
				<div class="flex-1" />
				<button
					type="button"
					onClick={() => setShowPreview((s) => !s)}
					class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors bg-transparent"
				>
					<span class="i-mdi:eye" aria-hidden="true" />
					{showPreview() ? "Hide preview" : "Show preview"}
				</button>
				<button
					type="button"
					onClick={handleCopy}
					class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors bg-transparent"
				>
					<span class="i-mdi:content-copy" aria-hidden="true" />
					Copy .md
				</button>
				<button
					type="button"
					onClick={handleDownload}
					class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors bg-transparent"
				>
					<span class="i-mdi:download" aria-hidden="true" />
					Download .md
				</button>
				<Show when={canSave()}>
					<button
						type="button"
						onClick={handleSave}
						class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border text-xs text-success hover:text-foreground hover:bg-surface transition-colors bg-transparent"
					>
						<span class="i-mdi:github" aria-hidden="true" />
						Save to GitHub
					</button>
				</Show>
			</div>
			<Show when={message()}>
				<div class="mb-4 text-sm text-success">{message()}</div>
			</Show>
			<div
				class={`grid gap-6 ${showPreview() ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
			>
				<div class="flex flex-col gap-2">
					<label class="text-xs text-muted uppercase tracking-wider">
						Markdown source
						<textarea
							value={source()}
							onInput={(e) => setSource(e.currentTarget.value)}
							class="w-full h-[70vh] p-4 mt-2 rounded-md border border-border bg-surface font-mono text-sm text-foreground resize-none focus:outline-none focus:border-focus"
							spellcheck={false}
						/>
					</label>
				</div>
				<Show when={showPreview()}>
					<div class="flex flex-col gap-2 min-w-0">
						<div
							id="edit-preview-label"
							class="text-xs text-muted uppercase tracking-wider"
						>
							Live preview
						</div>
						<section
							aria-labelledby="edit-preview-label"
							class="flex-1 rounded-md border border-border bg-bg p-4 overflow-auto h-[70vh]"
						>
							<DocMarkdown source={source()} />
						</section>
					</div>
				</Show>
			</div>
		</div>
	);
}
