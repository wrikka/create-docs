import { createResource, Show } from "solid-js";
import { useDocs } from "../context";
import { fetchRepoStats, shieldsBadge } from "../github";

export function GitHubStats() {
	const config = useDocs();
	const github = () => config.github;
	const enabled = () => github()?.stats;

	const [stats] = createResource(
		() => (enabled() ? github() : undefined),
		async (cfg) => {
			if (!cfg) return null;
			// Never let a GitHub API failure (rate limit, offline, missing
			// token) crash the page — the badges below still render.
			return fetchRepoStats(cfg).catch(() => null);
		},
	);

	return (
		<Show when={enabled() && github()}>
			{(cfg) => (
				<section
					class="flex items-center gap-2 flex-wrap"
					aria-label="GitHub stats"
				>
					<a
						href={`https://github.com/${cfg().owner}/${cfg().repo}/stargazers`}
						target="_blank"
						rel="noreferrer"
						class="inline-block"
					>
						<img
							src={shieldsBadge(cfg().owner, cfg().repo, "stars")}
							alt="GitHub stars"
							loading="lazy"
							class="h-5"
						/>
					</a>
					<a
						href={`https://github.com/${cfg().owner}/${cfg().repo}/forks`}
						target="_blank"
						rel="noreferrer"
						class="inline-block"
					>
						<img
							src={shieldsBadge(cfg().owner, cfg().repo, "forks")}
							alt="GitHub forks"
							loading="lazy"
							class="h-5"
						/>
					</a>
					<a
						href={`https://github.com/${cfg().owner}/${cfg().repo}/issues`}
						target="_blank"
						rel="noreferrer"
						class="inline-block"
					>
						<img
							src={shieldsBadge(cfg().owner, cfg().repo, "issues")}
							alt="GitHub issues"
							loading="lazy"
							class="h-5"
						/>
					</a>
					<Show when={stats()}>
						{(s) => (
							<span class="text-xs text-muted">{s().openPRs} open PRs</span>
						)}
					</Show>
				</section>
			)}
		</Show>
	);
}
