import { createResource, For, Show } from "solid-js";
import type { GitHubConfig } from "../config";
import { useDocs } from "../context";
import { fetchCommits, fetchContributors, fetchMilestones } from "../github";

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

export function CommunityPage() {
	const config = useDocs();
	const github = () =>
		config.github?.contributors ? (config.github as GitHubConfig) : undefined;

	const [contributors] = createResource(github, (cfg) =>
		fetchContributors(cfg).catch(() => []),
	);
	const [commits] = createResource(github, (cfg) =>
		fetchCommits(cfg, cfg.branch).catch(() => []),
	);
	const [milestones] = createResource(github, (cfg) =>
		fetchMilestones(cfg).catch(() => []),
	);

	return (
		<div class="max-w-4xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">Community</h1>
			<p class="text-muted mb-8">
				Contributors, recent activity, and project milestones
			</p>

			<section class="mb-12">
				<h2 class="text-xl font-semibold mb-4">Contributors</h2>
				<Show when={contributors.loading}>
					<p class="text-muted">Loading contributors…</p>
				</Show>
				<Show
					when={!contributors.loading && (contributors() ?? []).length === 0}
				>
					<p class="text-muted">No contributors found.</p>
				</Show>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					<For each={contributors() ?? []}>
						{(c) => (
							<a
								href={c.html_url}
								target="_blank"
								rel="noreferrer"
								class="flex items-center gap-3 border border-border rounded-lg p-3 hover:border-primary transition-colors"
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

			<Show when={(milestones() ?? []).length > 0}>
				<section class="mb-12">
					<h2 class="text-xl font-semibold mb-4">Milestones</h2>
					<div class="space-y-3">
						<For each={milestones() ?? []}>
							{(m) => {
								const total = () => m.open_issues + m.closed_issues;
								const pct = () =>
									total() === 0
										? 0
										: Math.round((m.closed_issues / total()) * 100);
								return (
									<div class="border border-border rounded-lg p-4">
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
														? "bg-emerald-500/15 text-emerald-500"
														: "bg-gray-500/15 text-gray-500"
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
				<h2 class="text-xl font-semibold mb-4">Recent commits</h2>
				<Show when={commits.loading}>
					<p class="text-muted">Loading commits…</p>
				</Show>
				<Show when={!commits.loading && (commits() ?? []).length === 0}>
					<p class="text-muted">No commits found.</p>
				</Show>
				<ul class="space-y-2">
					<For each={commits() ?? []}>
						{(c) => (
							<li class="flex items-baseline gap-3 border border-border rounded-lg px-4 py-2">
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
