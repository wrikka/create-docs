import { createSignal, For, onMount, Show } from "solid-js";
import { GitHubStats } from "../components/GitHubStats";
import { SkeletonPage } from "../components/Skeleton";
import type { GitHubConfig } from "../config";
import { useDocs } from "../context";
import {
	type BranchInfo,
	type CommitInfo,
	type Contributor,
	fetchBranches,
	fetchCommits,
	fetchContributors,
	fetchIssues,
	fetchMilestones,
	fetchRepoStats,
	fetchTags,
	GitHubFetchError,
	type IssueInfo,
	type MilestoneInfo,
	type RepoStats,
	type TagInfo,
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

	const [contributors, setContributors] = createSignal<Contributor[]>([]);
	const [commits, setCommits] = createSignal<CommitInfo[]>([]);
	const [milestones, setMilestones] = createSignal<MilestoneInfo[]>([]);
	const [tags, setTags] = createSignal<TagInfo[]>([]);
	const [branches, setBranches] = createSignal<BranchInfo[]>([]);
	const [issues, setIssues] = createSignal<IssueInfo[]>([]);
	const [stats, setStats] = createSignal<RepoStats | null>(null);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	onMount(async () => {
		const cfg = github();
		if (!cfg) {
			setLoading(false);
			return;
		}
		try {
			const [c, m, h, t, b, i, s] = await Promise.all([
				fetchContributors(cfg),
				fetchMilestones(cfg),
				fetchCommits(cfg, cfg.branch),
				cfg.releases ? fetchTags(cfg) : ([] as TagInfo[]),
				fetchBranches(cfg),
				cfg.issues ? fetchIssues(cfg) : ([] as IssueInfo[]),
				fetchRepoStats(cfg),
			]);
			setContributors(c);
			setMilestones(m);
			setCommits(h);
			setTags(t);
			setBranches(b);
			setIssues(i);
			setStats(s);
		} catch (err) {
			setError(errorText(err));
		} finally {
			setLoading(false);
		}
	});

	return (
		<div class="max-w-5xl mx-auto px-6 py-8 pb-24">
			<h1 class="text-3xl font-bold mb-2">Community</h1>
			<p class="text-muted mb-6">
				Contributors, recent activity, milestones, tags, and issues.
			</p>

			<div class="flex justify-start mb-8">
				<GitHubStats />
			</div>

			<Show when={stats()}>
				{(s) => (
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
						<div class="border border-border rounded-lg p-3 bg-surface/30 text-center">
							<div class="text-2xl font-bold text-foreground">{s().stars}</div>
							<div class="text-xs text-muted">Stars</div>
						</div>
						<div class="border border-border rounded-lg p-3 bg-surface/30 text-center">
							<div class="text-2xl font-bold text-foreground">{s().forks}</div>
							<div class="text-xs text-muted">Forks</div>
						</div>
						<div class="border border-border rounded-lg p-3 bg-surface/30 text-center">
							<div class="text-2xl font-bold text-foreground">
								{s().openIssues}
							</div>
							<div class="text-xs text-muted">Open issues</div>
						</div>
						<div class="border border-border rounded-lg p-3 bg-surface/30 text-center">
							<div class="text-2xl font-bold text-foreground">
								{s().openPRs}
							</div>
							<div class="text-xs text-muted">Open PRs</div>
						</div>
					</div>
				)}
			</Show>

			<Show when={loading()}>
				<SkeletonPage />
			</Show>

			<Show when={!loading() && error()}>
				<div class="mb-8 border border-destructive/30 bg-destructive/10 rounded-lg p-5">
					<div class="flex items-center gap-2 mb-1 text-destructive font-medium">
						<span class="i-mdi:alert-circle" aria-hidden="true" />
						Could not load community data
					</div>
					<p class="text-sm text-destructive/90 mb-3">{error()}</p>
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

			<Show when={!loading() && !error()}>
				<section class="mb-12">
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<span class="i-mdi:account-group" aria-hidden="true" />
						Contributors
					</h2>
					<Show when={contributors().length === 0}>
						<div class="flex flex-col items-center gap-2 py-12 rounded-lg border border-dashed border-border text-muted">
							<span
								class="i-mdi:account-question text-4xl"
								aria-hidden="true"
							/>
							<p class="m-0">No contributors found.</p>
						</div>
					</Show>
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						<For each={contributors()}>
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

				<Show when={milestones().length > 0}>
					<section class="mb-12">
						<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
							<span class="i-mdi:flag-checkered" aria-hidden="true" />
							Milestones
						</h2>
						<div class="space-y-3">
							<For each={milestones().slice(0, 10)}>
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
												{m.closed_issues} closed · {m.open_issues} open ·{" "}
												{pct()}%
											</div>
										</div>
									);
								}}
							</For>
						</div>
					</section>
				</Show>

				<div class="grid md:grid-cols-2 gap-8 mb-12">
					<section>
						<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
							<span class="i-mdi:tag-outline" aria-hidden="true" />
							Tags
						</h2>
						<Show when={tags().length === 0}>
							<p class="text-sm text-muted">No tags found.</p>
						</Show>
						<div class="flex flex-wrap gap-2">
							<For each={tags().slice(0, 24)}>
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
					</section>

					<section>
						<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
							<span class="i-mdi:source-branch" aria-hidden="true" />
							Branches
						</h2>
						<Show when={branches().length === 0}>
							<p class="text-sm text-muted">No branches found.</p>
						</Show>
						<div class="flex flex-wrap gap-2">
							<For each={branches().slice(0, 12)}>
								{(b) => (
									<a
										href={`${config.site.repoUrl}/tree/${b.name}`}
										target="_blank"
										rel="noreferrer"
										class="text-xs px-2.5 py-1 rounded-full border border-border bg-surface text-muted hover:text-foreground hover:border-focus transition-colors no-underline"
									>
										{b.name}
									</a>
								)}
							</For>
						</div>
					</section>
				</div>

				<Show when={issues().length > 0}>
					<section class="mb-12">
						<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
							<span class="i-mdi:alert-circle-outline" aria-hidden="true" />
							Open issues
						</h2>
						<div class="space-y-2">
							<For each={issues().slice(0, 10)}>
								{(i) => (
									<a
										href={i.html_url}
										target="_blank"
										rel="noreferrer"
										class="flex items-center gap-3 border border-border rounded-lg px-4 py-2 bg-surface/30 hover:border-focus transition-colors no-underline"
									>
										<span
											class="i-mdi:alert-circle-outline text-success shrink-0"
											aria-hidden="true"
										/>
										<span class="flex-1 min-w-0 truncate text-sm text-foreground">
											{i.title}
										</span>
										<span class="text-xs text-muted shrink-0">#{i.number}</span>
									</a>
								)}
							</For>
						</div>
					</section>
				</Show>

				<section>
					<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
						<span class="i-mdi:source-commit" aria-hidden="true" />
						Recent commits
					</h2>
					<Show when={commits().length === 0}>
						<div class="flex flex-col items-center gap-2 py-12 rounded-lg border border-dashed border-border text-muted">
							<span class="i-mdi:source-branch text-4xl" aria-hidden="true" />
							<p class="m-0">No commits found.</p>
						</div>
					</Show>
					<ul class="space-y-2">
						<For each={commits().slice(0, 20)}>
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
			</Show>
		</div>
	);
}
