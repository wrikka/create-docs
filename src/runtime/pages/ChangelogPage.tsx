import { createResource, createSignal, For, onMount, Show } from "solid-js";
import { DocMarkdown } from "../components/DocMarkdown";
import { SkeletonPage } from "../components/Skeleton";
import { useDocs } from "../context";
import {
	fetchReleases,
	fetchTags,
	GitHubFetchError,
	type ReleaseInfo,
	type TagInfo,
} from "../github";

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return iso;
	}
}

export function ChangelogPage() {
	const config = useDocs();
	const [tab, setTab] = createSignal<"releases" | "file">("releases");
	const [releases, setReleases] = createSignal<ReleaseInfo[]>([]);
	const [tags, setTags] = createSignal<TagInfo[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const currentCollection = () => config.defaultCollection ?? "";

	const [fileChangelog] = createResource(
		() => currentCollection(),
		async (collection) => {
			try {
				const entries = await config.dataSource.list(collection);
				const id = entries.find(
					(e) =>
						e.id.toLowerCase().includes("changelog") ||
						e.label.toLowerCase().includes("changelog"),
				)?.id;
				if (!id) return null;
				const c = await config.dataSource.get(collection, id);
				return c.content;
			} catch {
				return null;
			}
		},
	);

	onMount(async () => {
		const cfg = config.github;
		if (!cfg?.releases) {
			setLoading(false);
			return;
		}
		try {
			const [r, t] = await Promise.all([
				fetchReleases(cfg),
				cfg?.releases ? fetchTags(cfg) : ([] as TagInfo[]),
			]);
			setReleases(r);
			setTags(t);
		} catch (err) {
			if (err instanceof GitHubFetchError) {
				setError(
					err.status === 404
						? "Releases not found. Make sure the repository is public."
						: `${err.message}: ${err.payload ?? ""}`.slice(0, 200),
				);
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Could not load releases from GitHub.");
			}
		} finally {
			setLoading(false);
		}
	});

	return (
		<div class="max-w-3xl mx-auto px-6 py-8 pb-24">
			<h1 class="text-3xl font-bold mb-2">Changelog</h1>
			<p class="text-muted mb-6">Releases and file-based changelog.</p>

			<div class="flex items-center gap-2 mb-6 border-b border-border">
				<button
					type="button"
					onClick={() => setTab("releases")}
					class={`px-3 py-2 text-sm border-b-2 transition-colors cursor-pointer border-none bg-transparent ${
						tab() === "releases"
							? "border-primary text-foreground"
							: "border-transparent text-muted hover:text-foreground"
					}`}
				>
					<span class="i-mdi:tag-outline" aria-hidden="true" /> Releases
				</button>
				<Show when={fileChangelog()}>
					<button
						type="button"
						onClick={() => setTab("file")}
						class={`px-3 py-2 text-sm border-b-2 transition-colors cursor-pointer border-none bg-transparent ${
							tab() === "file"
								? "border-primary text-foreground"
								: "border-transparent text-muted hover:text-foreground"
						}`}
					>
						<span class="i-mdi:file-document-outline" aria-hidden="true" />{" "}
						Changelog file
					</button>
				</Show>
			</div>

			<Show when={loading()}>
				<SkeletonPage />
			</Show>

			<Show when={!loading() && error()}>
				<div class="border border-destructive/30 bg-destructive/10 rounded-lg p-5 mb-6">
					<div class="flex items-center gap-2 mb-1 text-destructive font-medium">
						<span class="i-mdi:alert-circle" aria-hidden="true" />
						Failed to load releases
					</div>
					<p class="text-sm text-destructive/90 mb-3">{error()}</p>
					<Show when={config.site.repoUrl}>
						<a
							href={`${config.site.repoUrl}/releases`}
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-1.5 text-sm text-destructive font-medium underline underline-offset-2"
						>
							View on GitHub
							<span class="i-mdi:open-in-new" aria-hidden="true" />
						</a>
					</Show>
				</div>
			</Show>

			<Show when={tab() === "file" && fileChangelog()}>
				<div class="border border-border rounded-lg p-5 bg-surface/30">
					<DocMarkdown source={fileChangelog() ?? ""} />
				</div>
			</Show>

			<Show when={tab() === "releases"}>
				<Show when={!loading() && !error() && releases().length === 0}>
					<div class="flex flex-col items-center gap-3 py-16 rounded-lg border border-dashed border-border text-muted">
						<span class="i-mdi:history text-4xl" aria-hidden="true" />
						<p class="m-0">No releases found for this repository.</p>
						<Show when={config.site.repoUrl}>
							<a
								href={`${config.site.repoUrl}/releases/new`}
								target="_blank"
								rel="noreferrer"
								class="text-sm text-primary underline underline-offset-2"
							>
								Create a release
							</a>
						</Show>
					</div>
				</Show>

				<Show when={tags().length > 0}>
					<div class="flex flex-wrap gap-2 mb-6">
						<For each={tags().slice(0, 20)}>
							{(t) => (
								<a
									href={`${config.site.repoUrl}/releases/tag/${t.name}`}
									target="_blank"
									rel="noreferrer"
									class="text-xs px-2.5 py-1 rounded-full border border-border bg-surface text-muted hover:text-foreground hover:border-focus transition-colors no-underline"
								>
									{t.name}
								</a>
							)}
						</For>
					</div>
				</Show>

				<div class="space-y-6">
					<For each={releases()}>
						{(release) => (
							<article class="border border-border rounded-lg p-5 bg-surface/30 hover:border-focus transition-colors">
								<div class="flex items-center gap-2 mb-2">
									<h2 class="text-xl font-semibold m-0">
										<a
											href={release.html_url}
											target="_blank"
											rel="noreferrer"
											class="hover:text-primary transition-colors"
										>
											{release.name || release.tag_name}
										</a>
									</h2>
									<span class="text-xs text-muted ml-auto">
										{formatDate(release.published_at)}
									</span>
								</div>
								<DocMarkdown source={release.body ?? "No release notes."} />
							</article>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
