import { describe, expect, it } from "vitest";
import {
	createMemoryFileReader,
	memoryFileSystem,
} from "../src/adapters/fs/memory-fs";
import {
	buildDocPageFromRaw,
	loadDocPage,
} from "../src/modules/content/application/usecases/load-doc-page";

describe("memory FileReader", () => {
	const fs = memoryFileSystem(
		new Map([
			["/docs/a.md", "---\ntitle: A\n---\n# A"],
			["/docs/b.mdoc", "---\ntitle: B\n---\n# B"],
			["/docs", ""],
		]),
		new Map([["/docs", ["a.md", "b.mdoc"]]]),
	);

	it("reads a .md file", async () => {
		const reader = createMemoryFileReader(fs);
		const r = await reader.read("/docs/a.md" as never);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toContain("# A");
	});
	it("reports exists correctly", async () => {
		const reader = createMemoryFileReader(fs);
		expect(await reader.exists("/docs/a.md" as never)).toBe(true);
		expect(await reader.exists("/docs/missing.md" as never)).toBe(false);
	});
	it("stat returns size from content length", async () => {
		const reader = createMemoryFileReader(fs);
		const s = await reader.stat("/docs/a.md" as never);
		expect(s.ok).toBe(true);
		if (s.ok) expect(s.value.size).toBeGreaterThan(0);
	});
});

describe("loadDocPage via in-memory reader", () => {
	const fs = memoryFileSystem(
		new Map([
			["/docs/x.md", "---\ntitle: X\norder: 1\n---\n# X\n\nBody."],
			["/docs", ""],
		]),
		new Map([["/docs", ["x.md"]]]),
	);
	const reader = createMemoryFileReader(fs);

	it("builds a DocPage with toc and metadata", async () => {
		const r = await loadDocPage({
			reader,
			docsDir: "/docs",
			slug: "x",
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.title).toBe("X");
			expect(r.value.order).toBe(1);
			expect(r.value.toc.length).toBeGreaterThan(0);
			expect(r.value.metadata.wordCount).toBeGreaterThan(0);
		}
	});

	it("attaches per-page editUrl when editLink provided", async () => {
		const r = await loadDocPage({
			reader,
			docsDir: "/docs",
			slug: "x",
			editLink: {
				enabled: true,
				baseUrl: "https://github.com/me/repo",
				branch: "main",
			},
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.metadata.editUrl).toBe(
				"https://github.com/me/repo/edit/main/x.md",
			);
		}
	});

	it("returns fileNotFound for missing slug", async () => {
		const r = await loadDocPage({
			reader,
			docsDir: "/docs",
			slug: "missing",
		});
		expect(r.ok).toBe(false);
	});
});

describe("buildDocPageFromRaw", () => {
	it("works without I/O", () => {
		const r = buildDocPageFromRaw("x", "/x.md", "---\ntitle: T\n---\n# H");
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.title).toBe("T");
			expect(r.value.toc[0]?.text).toBe("H");
		}
	});
});
