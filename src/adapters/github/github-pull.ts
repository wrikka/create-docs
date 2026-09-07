/**
 * Build-time GitHub docs puller.
 *
 * Given a list of remote GitHub repositories (or local directories), fetch the
 * docs tree and write markdown + frontmatter files to a local directory. The
 * output is consumed by `createStaticDataSource()` in the Solid runtime: files
 * are organised under `docs/{collectionId}/...` and `sources.json` /
 * `manifest.json` are emitted next to them.
 */

import {
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import * as path from "node:path";
import { parseFrontmatter } from "../../runtime/content";

export interface GitHubSource {
	/** Collection id used in the URL and sidebar. */
	id: string;
	/** Human-readable label. Defaults to the repo name. */
	label?: string;
	/** Short description for the collection. */
	description?: string;
	/** Repository URL or `owner/repo`. */
	repo: string;
	/** Branch or tag. */
	branch?: string;
	/** Path inside the repo where the docs live. Defaults to `docs`. */
	docsDir?: string;
	/** Iconify icon class. */
	icon?: string;
	/** Optional local docs directory; when set, files are copied instead of fetching from GitHub. */
	localDir?: string;
	/** When true, continue with a warning if this source cannot be fetched. */
	optional?: boolean;
}

export interface GitHubPullOptions {
	/** Output directory for pulled docs and the generated manifest. */
	outDir: string;
	/** GitHub sources. */
	sources: GitHubSource[];
	/** Optional token for private repositories and higher rate limits. */
	token?: string;
	/** Optional GitHub API base URL. */
	apiBase?: string;
	/** Optional raw base URL. */
	rawBase?: string;
}

export interface PullResult {
	/** Collection metadata written to `sources.json`. */
	collections: Array<{
		id: string;
		label: string;
		description?: string;
		icon?: string;
		repoUrl?: string;
	}>;
	/** Number of files written. */
	filesWritten: number;
	/** Output directory. */
	outDir: string;
	/** Manifest for SEO and server-side consumers. */
	manifest: DocsManifest;
}

export interface DocsManifest {
	collections: PullResult["collections"];
	docs: Record<
		string,
		Array<{
			id: string;
			label: string;
			category: string;
			description: string;
			path: string;
			type: "md";
		}>
	>;
}

interface RepoRef {
	owner: string;
	name: string;
}

function parseRepo(repo: string): RepoRef {
	const clean = repo
		.replace(/https?:\/\/github\.com\//, "")
		.replace(/\.git$/, "");
	const parts = clean.split("/");
	if (parts.length < 2) {
		throw new Error(`Invalid repo: ${repo}`);
	}
	return { owner: parts[0] as string, name: parts[1] as string };
}

function authHeaders(token?: string): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "create-docs",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	return headers;
}

function toPosix(p: string): string {
	return p.replace(/\\/g, "/");
}

function relativeWithinDocs(filePath: string, docsDir: string): string {
	const normalized = toPosix(filePath).replace(/^\//, "");
	const prefix = toPosix(docsDir).replace(/\/$/, "").replace(/^\//, "");
	if (
		prefix &&
		(normalized === prefix || normalized.startsWith(`${prefix}/`))
	) {
		return normalized.slice(prefix.length + (prefix ? 1 : 0));
	}
	return normalized;
}

interface TreeItem {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size?: number;
	url: string;
}

async function fetchTree(
	ref: RepoRef,
	branch: string,
	token: string | undefined,
	apiBase: string,
): Promise<TreeItem[]> {
	const url = `${apiBase}/repos/${ref.owner}/${ref.name}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
	const res = await fetch(url, { headers: authHeaders(token) });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub API error ${res.status}: ${text}`);
	}
	const data = (await res.json()) as { tree?: TreeItem[] };
	return data.tree ?? [];
}

async function fetchRaw(
	ref: RepoRef,
	branch: string,
	filePath: string,
	rawBase: string,
	token: string | undefined,
): Promise<string> {
	const url = `${rawBase}/${ref.owner}/${ref.name}/${encodeURIComponent(branch)}/${toPosix(filePath)}`;
	const headers: Record<string, string> = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	const res = await fetch(url, { headers });
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status}`);
	}
	return res.text();
}

function makeDocId(relativePath: string): string {
	return relativePath.replace(/\.(md|mdx)$/i, "").replace(/[/\\]/g, "--");
}

interface LocalFile {
	relative: string;
	absolute: string;
}

const EXCLUDED_DIRS = new Set([
	"node_modules",
	"dist",
	"build",
	"coverage",
	".git",
	".vitepress",
	".next",
	".turbo",
	".cache",
]);

function isExcludedPath(relative: string): boolean {
	return relative
		.split("/")
		.some((seg) => EXCLUDED_DIRS.has(seg) || seg.startsWith("."));
}

function scanLocalDir(dir: string, prefix = ""): LocalFile[] {
	const items: LocalFile[] = [];
	for (const name of readdirSync(dir)) {
		const absolute = path.join(dir, name);
		const relative = prefix ? `${prefix}/${name}` : name;
		if (statSync(absolute).isDirectory()) {
			if (EXCLUDED_DIRS.has(name) || name.startsWith(".")) continue;
			items.push(...scanLocalDir(absolute, relative));
		} else if (/\.(md|mdx)$/i.test(name) || /^_dir\.ya?ml$/i.test(name)) {
			items.push({ relative, absolute });
		}
	}
	return items;
}

function addDocToManifest(
	docs: DocsManifest["docs"],
	collectionId: string,
	raw: string,
	docPath: string,
): void {
	const { data: fm, content } = parseFrontmatter(raw);
	const parts = docPath.split("/");
	const dir = parts.slice(0, -1).join("/");
	const file = parts[parts.length - 1] ?? "";
	const category =
		fm.category ?? (dir ? dir.split("/").pop() : "Docs") ?? "Docs";
	const label = fm.title ?? file.replace(/\.(md|mdx)$/i, "");
	const description =
		fm.description ??
		content
			.split("\n")
			.find((l) => l.trim() && !l.startsWith("#"))
			?.trim() ??
		"";

	docs[collectionId] ??= [];
	const list = docs[collectionId];
	list.push({
		id: makeDocId(docPath),
		label,
		category,
		description,
		path: docPath,
		type: "md",
	});
}

export async function pullFromGitHub(
	options: GitHubPullOptions,
): Promise<PullResult> {
	const {
		outDir,
		sources,
		token = process.env.GITHUB_TOKEN,
		apiBase = "https://api.github.com",
		rawBase = "https://raw.githubusercontent.com",
	} = options;

	const resolvedOut = path.resolve(outDir);
	const docsOut = path.join(resolvedOut, "docs");
	const collections: PullResult["collections"] = [];
	const docs: DocsManifest["docs"] = {};
	let filesWritten = 0;

	for (const source of sources) {
		try {
			const ref = parseRepo(source.repo);
			const repoUrl = `https://github.com/${ref.owner}/${ref.name}`;
			const branch = source.branch ?? "main";
			const docsDir = source.docsDir ?? "docs";
			const collectionId = source.id;

			const collectionOut = path.join(docsOut, collectionId);
			mkdirSync(collectionOut, { recursive: true });

			// Local mode: copy files from a local directory.
			if (source.localDir && statSync(source.localDir).isDirectory()) {
				const localFiles = scanLocalDir(source.localDir);
				for (const { relative, absolute } of localFiles) {
					const content = readFileSync(absolute, "utf8");
					const target = path.join(collectionOut, ...relative.split(/[/\\]/));
					mkdirSync(path.dirname(target), { recursive: true });
					writeFileSync(target, content, "utf8");
					filesWritten++;

					if (/\.(md|mdx)$/i.test(relative)) {
						addDocToManifest(docs, collectionId, content, toPosix(relative));
					}
				}
			} else {
				const tree = await fetchTree(ref, branch, token, apiBase);

				// Collect markdown and _dir.yml files under docsDir.
				const wanted: TreeItem[] = [];
				for (const item of tree) {
					if (item.type !== "blob") continue;
					const relative = relativeWithinDocs(item.path, docsDir);
					if (relative === item.path && docsDir !== "") continue;
					if (isExcludedPath(relative)) continue;
					if (
						/\.(md|mdx)$/i.test(relative) ||
						/^_dir\.ya?ml$/i.test(path.basename(relative))
					) {
						wanted.push(item);
					}
				}

				for (const item of wanted) {
					const relative = relativeWithinDocs(item.path, docsDir);
					const target = path.join(collectionOut, ...relative.split("/"));
					mkdirSync(path.dirname(target), { recursive: true });

					const raw = await fetchRaw(ref, branch, item.path, rawBase, token);
					writeFileSync(target, raw, "utf8");
					filesWritten++;

					if (/\.(md|mdx)$/i.test(relative)) {
						addDocToManifest(docs, collectionId, raw, toPosix(relative));
					}
				}
			}

			docs[collectionId] = (docs[collectionId] ?? []).sort((a, b) =>
				a.id.localeCompare(b.id),
			);

			collections.push({
				id: collectionId,
				label: source.label ?? ref.name,
				description: source.description,
				icon: source.icon,
				repoUrl,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (source.optional) {
				console.warn(
					`[create-docs] Skipped optional source "${source.id}": ${message}`,
				);
			} else {
				throw new Error(`Failed to pull source "${source.id}": ${message}`);
			}
		}
	}

	mkdirSync(resolvedOut, { recursive: true });
	const manifest: DocsManifest = { collections, docs };
	writeFileSync(
		path.join(resolvedOut, "sources.json"),
		JSON.stringify(collections, null, "\t"),
		"utf8",
	);
	writeFileSync(
		path.join(resolvedOut, "manifest.json"),
		JSON.stringify(manifest, null, "\t"),
		"utf8",
	);

	return { collections, filesWritten, outDir: resolvedOut, manifest };
}
