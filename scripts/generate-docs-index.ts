import {
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";

const root = fileURLToPath(new URL("..", import.meta.url));

const collections = [
	{ id: "docs", dir: join(root, "docs") },
	{ id: "api", dir: join(root, "api") },
	{ id: "showcase", dir: join(root, "showcase") },
];

function walk(dir: string): string[] {
	let entries: string[] = [];
	try {
		entries = readdirSync(dir);
	} catch {
		return [];
	}
	const files: string[] = [];
	for (const entry of entries) {
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			files.push(...walk(full));
		} else if (stat.isFile()) {
			files.push(full);
		}
	}
	return files;
}

function stripMarkdown(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[*_~`]/g, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function parseFrontmatter(content: string) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		return { frontmatter: {} as Record<string, unknown>, body: content };
	}
	let frontmatter: Record<string, unknown> = {};
	try {
		frontmatter = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
	} catch {
		frontmatter = {};
	}
	return { frontmatter, body: content.slice(match[0].length) };
}

const docs: Array<{
	collection: string;
	id: string;
	title: string;
	description: string;
	text: string;
	content: string;
}> = [];

for (const collection of collections) {
	const files = walk(collection.dir);
	for (const file of files) {
		if (!file.endsWith(".md")) continue;
		const rel = relative(collection.dir, file)
			.replace(/\\/g, "/")
			.replace(/\.md$/, "");
		const raw = readFileSync(file, "utf8");
		const { frontmatter, body } = parseFrontmatter(raw);
		const title =
			typeof frontmatter.title === "string" ? frontmatter.title : rel;
		const description =
			typeof frontmatter.description === "string"
				? frontmatter.description
				: "";
		docs.push({
			collection: collection.id,
			id: rel,
			title,
			description,
			text: stripMarkdown(body),
			content: body,
		});
	}
}

const outDir = process.argv.includes("--dev")
	? join(root, "dev", "dist")
	: join(root, "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(
	join(outDir, "search-index.json"),
	JSON.stringify({ docs }, null, 2),
);

console.log(`Generated ${docs.length} docs index entries`);
