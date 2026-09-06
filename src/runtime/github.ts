import type { GitHubConfig } from "./config";

export interface ReleaseInfo {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	published_at: string;
	html_url: string;
	author: { login: string; avatar_url: string };
}

export interface RepoStats {
	stars: number;
	forks: number;
	openIssues: number;
	openPRs: number;
}

export interface Contributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

export interface CommitInfo {
	sha: string;
	message: string;
	author: string;
	date: string;
	html_url: string;
}

export function githubApiUrl(config: GitHubConfig, path: string): string {
	return `https://api.github.com/repos/${config.owner}/${config.repo}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url, {
		headers: { Accept: "application/vnd.github+json" },
	});
	if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
	return res.json() as Promise<T>;
}

export async function fetchReleases(
	config: GitHubConfig,
): Promise<ReleaseInfo[]> {
	return fetchJson<ReleaseInfo[]>(
		githubApiUrl(config, "/releases?per_page=30"),
	);
}

export async function fetchRepoStats(config: GitHubConfig): Promise<RepoStats> {
	const [repo, pulls] = await Promise.all([
		fetchJson<{
			stargazers_count: number;
			forks_count: number;
			open_issues_count: number;
		}>(githubApiUrl(config, "")),
		fetchJson<{ total_count: number }>(
			`https://api.github.com/search/issues?q=repo:${config.owner}/${config.repo}+type:pr+state:open&per_page=1`,
		),
	]);
	return {
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		openIssues: repo.open_issues_count,
		openPRs: pulls.total_count,
	};
}

export async function fetchContributors(
	config: GitHubConfig,
): Promise<Contributor[]> {
	return fetchJson<Contributor[]>(
		githubApiUrl(config, "/contributors?per_page=100"),
	);
}

export async function fetchCommits(
	config: GitHubConfig,
	branch?: string,
): Promise<CommitInfo[]> {
	const ref = branch ?? "main";
	const raw = await fetchJson<
		{
			sha: string;
			commit: { message: string; author: { name: string; date: string } };
			html_url: string;
		}[]
	>(githubApiUrl(config, `/commits?sha=${ref}&per_page=20`));
	return raw.map((r) => ({
		sha: r.sha.slice(0, 7),
		message: r.commit.message.split("\n")[0] ?? "",
		author: r.commit.author.name,
		date: r.commit.author.date,
		html_url: r.html_url,
	}));
}

export function shieldsBadge(
	owner: string,
	repo: string,
	type: "stars" | "forks" | "issues" | "prs",
): string {
	const label =
		type === "stars"
			? "stars"
			: type === "forks"
				? "forks"
				: type === "issues"
					? "issues"
					: "prs";
	return `https://img.shields.io/github/${type === "prs" ? "issues-pr" : type}/${owner}/${repo}?style=flat-square&label=${label}`;
}
