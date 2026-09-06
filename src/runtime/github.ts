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

function githubBaseUrl(): string {
	// In production builds, use the Cloudflare Worker proxy so a GITHUB_TOKEN
	// can be attached server-side. In dev, call the GitHub API directly.
	return import.meta.env.PROD ? "/api/github" : "https://api.github.com";
}

export function githubApiUrl(config: GitHubConfig, path: string): string {
	return `${githubBaseUrl()}/repos/${config.owner}/${config.repo}${path}`;
}

export class GitHubFetchError extends Error {
	status: number;
	payload?: string;
	constructor(status: number, message: string, payload?: string) {
		super(message);
		this.status = status;
		this.payload = payload;
	}
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url, {
		headers: { Accept: "application/vnd.github+json" },
	});
	const text = await res.text();
	if (!res.ok) {
		throw new GitHubFetchError(
			res.status,
			`GitHub API error ${res.status}`,
			text,
		);
	}
	try {
		return JSON.parse(text) as T;
	} catch {
		throw new GitHubFetchError(res.status, "Invalid JSON from GitHub", text);
	}
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
			`${githubBaseUrl()}/search/issues?q=repo:${config.owner}/${config.repo}+type:pr+state:open&per_page=1`,
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

export interface TagInfo {
	name: string;
	sha: string;
	commit: { sha: string; url: string };
}

export interface BranchInfo {
	name: string;
	commit: { sha: string };
}

export interface IssueInfo {
	number: number;
	title: string;
	state: string;
	html_url: string;
	created_at: string;
	updated_at: string;
	comments: number;
	user: { login: string; avatar_url: string };
	labels: { name: string; color: string }[];
}

export interface MilestoneInfo {
	number: number;
	title: string;
	description: string | null;
	state: string;
	open_issues: number;
	closed_issues: number;
	due_on: string | null;
	html_url: string;
}

export async function fetchMilestones(
	config: GitHubConfig,
): Promise<MilestoneInfo[]> {
	return fetchJson<MilestoneInfo[]>(
		githubApiUrl(config, "/milestones?state=all&per_page=50"),
	);
}

export async function fetchTags(config: GitHubConfig): Promise<TagInfo[]> {
	return fetchJson<TagInfo[]>(githubApiUrl(config, "/tags?per_page=30"));
}

export async function fetchBranches(
	config: GitHubConfig,
): Promise<BranchInfo[]> {
	return fetchJson<BranchInfo[]>(githubApiUrl(config, "/branches?per_page=30"));
}

export async function fetchLatestCommit(
	config: GitHubConfig,
	branch?: string,
): Promise<CommitInfo> {
	const ref = branch ?? config.branch ?? "main";
	const raw = await fetchJson<{
		sha: string;
		commit: { message: string; author: { name: string; date: string } };
		html_url: string;
	}>(githubApiUrl(config, `/commits/${ref}`));
	return {
		sha: raw.sha.slice(0, 7),
		message: raw.commit.message.split("\n")[0] ?? "",
		author: raw.commit.author.name,
		date: raw.commit.author.date,
		html_url: raw.html_url,
	};
}

export async function fetchIssues(config: GitHubConfig): Promise<IssueInfo[]> {
	return fetchJson<IssueInfo[]>(
		githubApiUrl(config, "/issues?state=open&sort=updated&per_page=30"),
	);
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
