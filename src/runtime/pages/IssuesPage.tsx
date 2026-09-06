import { createSignal, For, onMount, Show } from "solid-js";
import { SkeletonPage } from "../components/Skeleton";
import { useDocs } from "../context";
import { fetchIssues, GitHubFetchError, type IssueInfo } from "../github";

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

export function IssuesPage() {
	const config = useDocs();
	const [issues, setIssues] = createSignal<IssueInfo[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	onMount(async () => {
		const cfg = config.github;
		if (!cfg?.issues) {
			setLoading(false);
			return;
		}
		try {
			setIssues(await fetchIssues(cfg));
		} catch (err) {
			if (err instanceof GitHubFetchError) {
				setError(
					err.status === 404
						? "Issues not found. Make sure the repository is public."
						: `${err.message}: ${err.payload ?? ""}`.slice(0, 200),
				);
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Could not load issues from GitHub.");
			}
		} finally {
			setLoading(false);
		}
	});

	return (
		<div class="max-w-4xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">Issues</h1>
			<p class="text-muted mb-8">Open issues from GitHub</p>

			<Show when={loading()}>
				<SkeletonPage />
			</Show>

			<Show when={!loading() && error()}>
				<div class="border border-destructive/30 bg-destructive/10 rounded-lg p-5 mb-6">
					<div class="flex items-center gap-2 mb-1 text-destructive font-medium">
						<span class="i-mdi:alert-circle" aria-hidden="true" />
						Failed to load issues
					</div>
					<p class="text-sm text-destructive/90 mb-3">{error()}</p>
					<Show when={config.site.repoUrl}>
						<a
							href={`${config.site.repoUrl}/issues`}
							target="_blank"
							rel="noreferrer"
							class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
						>
							<span class="i-mdi:open-in-new" aria-hidden="true" />
							View on GitHub
						</a>
					</Show>
				</div>
			</Show>

			<Show
				when={!loading() && !error() && issues().length === 0}
			>
				<div class="flex flex-col items-center gap-3 py-16 rounded-lg border border-dashed border-border text-muted">
					<span class="i-mdi:check-circle text-4xl" aria-hidden="true" />
					<p class="m-0">No open issues.</p>
				</div>
			</Show>

			<div class="space-y-3">
				<For each={issues()}>
					{(issue) => (
						<article class="border border-border rounded-lg p-4 bg-surface/30 hover:border-focus transition-colors">
							<div class="flex items-start gap-3">
								<span
									class="i-mdi:alert-circle-outline text-lg text-primary mt-0.5"
									aria-hidden="true"
								/>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<span class="text-xs text-muted font-mono">
											#{issue.number}
										</span>
										<a
											href={issue.html_url}
											target="_blank"
											rel="noreferrer"
											class="font-medium hover:text-primary transition-colors truncate"
										>
											{issue.title}
										</a>
									</div>
									<div class="flex flex-wrap items-center gap-2 text-xs text-muted mb-2">
										<span>opened {formatDate(issue.created_at)}</span>
										<span>·</span>
										<span>{issue.comments} comments</span>
									</div>
									<Show when={issue.labels.length}>
										<div class="flex flex-wrap gap-1.5">
											<For each={issue.labels}>
												{(label) => (
													<span
														class="text-[10px] px-2 py-0.5 rounded-full border border-border"
														style={{
															"background-color": `#${label.color}20`,
															color: `#${label.color}`,
															"border-color": `#${label.color}40`,
														}}
													>
														{label.name}
													</span>
												)}
											</For>
										</div>
									</Show>
								</div>
							</div>
						</article>
					)}
				</For>
			</div>
		</div>
	);
}
