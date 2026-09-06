import { createResource, For, Show } from "solid-js";
import { SkeletonPage } from "../components/Skeleton";
import type { GitHubConfig } from "../config";
import { useDocs } from "../context";
import {
	fetchCommits,
	fetchContributors,
	fetchMilestones,
	GitHubFetchError,
} from "../github";

function formatDate(iso: string | null) {
	if (!iso) return null;
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

function errorText(err: unknown): string {
	if (err instanceof GitHubFetchError) {
		return err.status === 404
			? "Repository not found or not public."
			: err.status === 403
				? "GitHub rate limit exceeded. Try again later."
				: `${err.message}: ${err.payload ?? ""}`.slice(0, 200);
	}
	if (err instanceof Error) return err.message;
	return "Could not load data from GitHub.";
}

export function CommunityPage() {
	const config = useDocs();
	const github = () =>
		config.github?.contributors ? (config.github as GitHubConfig) : undefined;

	const [contributors] = createResource(github, (cfg) =>
		fetchContributors(cfg),
	);
	const [commits] = createResource(github, (cfg) =>
		fetchCommits(cfg, cfg.branch),
	);
	const [milestones] = createResource(github, (cfg) => fetchMilestones(cfg));

	const anyError = () =>
		contributors.error || commits.error || milestones.error;
	const firstError = () =>
		errorText(contributors.error ?? commits.error ?? milestones.error);

	const errorFor = (err: unknown) => (
		<div class="border border-destructive/30 bg-destructive/10 rounded-lg p-4">
			<div class="flex items-center gap-2 text-destructive font-medium text-sm">
				<span class="i-mdi:alert-circle" aria-hidden="true" />
				{errorText(err)}
			</div>
		</div>
	);

	return (
		<div class="max-w-4xl mx-auto px-6 py-8 pb-24">
			<h1 class="text-3xl font-bold mb-2">Community</h1>
			<p class="text-muted mb-8">
				Contributors, recent activity, and project milestones
			</p>

			<Show
				when={contributors.loading && commits.loading && milestones.loading}
			>
				<SkeletonPage />
			</Show>

			<Show when={!contributors.loading && !commits.loading && anyError()}>
				<div class="mb-8 border border-destructive/30 bg-destructive/10 rounded-lg p-5">
					<div class="flex items-center gap-2 mb-1 text-destructive font-medium">
						<span class="i-mdi:alert-circle" aria-hidden="true" />
						Could not load community data
					</div>
					<p class="text-sm text-destructive/90 mb-3">{firstError()}</p>
					<Show when={config.site.repoUrl}>
						<a
							href={config.site.repoUrl}
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

			<section class="mb-12">
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<span class="i-mdi:account-group" aria-hidden="true" />
					Contributors
				</h2>
				<Show when={contributors.error}>{errorFor(contributors.error)}</Show>
				<Show
					when={
						!contributors.loading &&
						!contributors.error &&
						(contributors() ?? []).length === 0
					}
				>
					<div class="flex flex-col items-center gap-2 py-12 rounded-lg border border-dashed border-border text-muted">
						<span class="i-mdi:account-question text-4xl" aria-hidden="true" />
						<p class="m-0">No contributors found.</p>
					</div>
				</Show>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					<For each={contributors() ?? []}>
						{(c) => (
							<a
								href={c.html_url}
								target="_blank"
								rel="noreferrer"
								class="flex items-center gap-3 border border-border rounded-lg p-3 hover:border-primary transition-colors bg-surface/30"
							>
								<img
									src={c.avatar_url}
									alt={c.login}
									width="40"
									height="40"
									class="rounded-full w-10 h-10"
									loading="lazy"
								/>
								<div class="min-w-0">
									<div class="font-medium truncate">{c.login}</div>
									<div class="text-xs text-muted">
										{c.contributions} commits
									</div>
								</div>
							</a>
						)}
					</For>
				</div>
			</section>

			<Show when={(milestones() ?? []).length > 0 || milestones.error}>
				<section class="mb-12">
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<span class="i-mdi:flag-checkered" aria-hidden="true" />
						Milestones
					</h2>
					<Show when={milestones.error}>{errorFor(milestones.error)}</Show>
					<div class="space-y-3">
						<For each={milestones() ?? []}>
							{(m) => {
								const total = () => m.open_issues + m.closed_issues;
								const pct = () =>
									total() === 0
										? 0
										: Math.round((m.closed_issues / total()) * 100);
								return (
									<div class="border border-border rounded-lg p-4 bg-surface/30">
										<div class="flex items-center gap-2 mb-1">
											<a
												href={m.html_url}
												target="_blank"
												rel="noreferrer"
												class="font-medium hover:text-primary transition-colors"
											>
												{m.title}
											</a>
											<span
												class={`text-xs px-2 py-0.5 rounded-full ${
													m.state === "open"
														? "bg-primary/15 text-primary"
														: "bg-muted/20 text-muted"
												}`}
											>
												{m.state}
											</span>
											<Show when={m.due_on}>
												<span class="text-xs text-muted ml-auto">
													Due {formatDate(m.due_on)}
												</span>
											</Show>
										</div>
										<Show when={m.description}>
											<p class="text-sm text-muted mb-2">{m.description}</p>
										</Show>
										<div
											class="h-2 rounded-full bg-muted/20 overflow-hidden"
											role="progressbar"
											aria-valuenow={pct()}
											aria-valuemin={0}
											aria-valuemax={100}
											aria-label={`${m.title} progress`}
										>
											<div
												class="h-full bg-primary transition-all"
												style={{ width: `${pct()}%` }}
											/>
										</div>
										<div class="text-xs text-muted mt-1">
											{m.closed_issues} closed · {m.open_issues} open · {pct()}%
										</div>
									</div>
								);
							}}
						</For>
					</div>
				</section>
			</Show>

			<section>
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<span class="i-mdi:source-commit" aria-hidden="true" />
					Recent commits
				</h2>
				<Show when={commits.error}>{errorFor(commits.error)}</Show>
				<Show
					when={
						!commits.loading && !commits.error && (commits() ?? []).length === 0
					}
				>
					<div class="flex flex-col items-center gap-2 py-12 rounded-lg border border-dashed border-border text-muted">
						<span class="i-mdi:source-branch text-4xl" aria-hidden="true" />
						<p class="m-0">No commits found.</p>
					</div>
				</Show>
				<ul class="space-y-2">
					<For each={commits() ?? []}>
						{(c) => (
							<li class="flex items-baseline gap-3 border border-border rounded-lg px-4 py-2 bg-surface/30">
								<code class="text-xs text-primary shrink-0">{c.sha}</code>
								<a
									href={c.html_url}
									target="_blank"
									rel="noreferrer"
									class="flex-1 min-w-0 truncate hover:text-primary transition-colors"
								>
									{c.message}
								</a>
								<span class="text-xs text-muted shrink-0 hidden sm:inline">
									{c.author} · {formatDate(c.date)}
								</span>
							</li>
						)}
					</For>
				</ul>
			</section>
		</div>
	);
}
