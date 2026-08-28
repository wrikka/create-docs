import { describe, expect, it } from "vitest";
import {
	createMemoryDirectoryScanner,
	memoryFileSystem,
} from "../src/adapters/fs/memory-fs";
import type { ResolvedDocsConfig } from "../src/modules/config";
import { resolveConfig } from "../src/modules/config";
import type { DocPage } from "../src/modules/content";
import type { DocsLoader } from "../src/modules/plugin";
import { buildDocs } from "../src/modules/plugin";
import type { AppError } from "../src/shared/errors";
import { ok, type Result } from "../src/shared/types/result";

const makeLoader = (pages: readonly DocPage[]): DocsLoader => ({
	async loadAll(
		_config: ResolvedDocsConfig,
	): Promise<Result<readonly DocPage[], AppError>> {
		return ok(pages);
	},
});

describe("buildDocs", () => {
	const config = resolveConfig({
		editLink: {
			enabled: true,
			baseUrl: "https://github.com/me/repo",
			branch: "main",
		},
	});

	it("returns the five virtual modules", async () => {
		const r = await buildDocs({
			config,
			loader: {
				async loadAll() {
					return ok([
						{
							id: "a" as never,
							slug: "a" as never,
							title: "A",
							frontmatter: { title: "A" },
							content: "# A",
							rawContent: "---\ntitle: A\n---\n# A",
							filePath: "/docs/a.md" as never,
							order: 0,
							toc: [],
							metadata: { readingTime: 1, wordCount: 1 },
						},
					]);
				},
			},
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			const keys = Object.keys(r.value);
			expect(keys).toHaveLength(5);
			expect(keys).toContain("virtual:docs/data");
			expect(keys).toContain("virtual:docs/nav");
			expect(keys).toContain("virtual:docs/search-index");
			expect(keys).toContain("virtual:docs/sidebar");
			expect(keys).toContain("virtual:docs/config");
		}
	});

	it("auto-generates sidebar when none configured", async () => {
		const r = await buildDocs({
			config,
			loader: makeLoader([
				{
					id: "guide-a" as never,
					slug: "guide/a" as never,
					title: "A",
					frontmatter: { title: "A" },
					content: "# A",
					rawContent: "",
					filePath: "/docs/guide/a.md" as never,
					group: "guide",
					order: 1,
					toc: [],
					metadata: { readingTime: 1, wordCount: 1 },
				},
				{
					id: "guide-b" as never,
					slug: "guide/b" as never,
					title: "B",
					frontmatter: { title: "B" },
					content: "# B",
					rawContent: "",
					filePath: "/docs/guide/b.md" as never,
					group: "guide",
					order: 2,
					toc: [],
					metadata: { readingTime: 1, wordCount: 1 },
				},
			]),
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			const sidebar = r.value["virtual:docs/sidebar"];
			expect(sidebar).toContain("Guide");
			expect(sidebar).toContain("guide/a");
		}
	});

	it("applies transformPage hook", async () => {
		const r = await buildDocs({
			config,
			loader: makeLoader([
				{
					id: "a" as never,
					slug: "a" as never,
					title: "A",
					frontmatter: { title: "A" },
					content: "# A",
					rawContent: "",
					filePath: "/docs/a.md" as never,
					order: 0,
					toc: [],
					metadata: { readingTime: 1, wordCount: 1 },
				},
			]),
			transformPage: (p) => ({ ...p, title: `Hi ${p.title}` }),
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			const data = r.value["virtual:docs/data"];
			expect(data).toContain("Hi A");
		}
	});

	it("returns error when loader fails", async () => {
		const r = await buildDocs({
			config,
			loader: {
				async loadAll() {
					return { ok: false, error: { kind: "io_error", message: "boom" } };
				},
			},
		});
		expect(r.ok).toBe(false);
	});
});

describe("createMemoryDirectoryScanner", () => {
	const fs = memoryFileSystem(new Map(), new Map([["/x", ["a.md", "b"]]]));
	it("lists entries", async () => {
		const s = createMemoryDirectoryScanner(fs);
		const r = await s.list("/x");
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toHaveLength(2);
	});
	it("returns fileNotFound for missing", async () => {
		const s = createMemoryDirectoryScanner(fs);
		const r = await s.list("/missing");
		expect(r.ok).toBe(false);
	});
});
