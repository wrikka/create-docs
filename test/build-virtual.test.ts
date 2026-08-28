import { describe, expect, it } from "vitest";
import {
	buildConfigModule,
	buildDocsDataModule,
	buildNavModule,
	buildSearchIndexModule,
	buildSidebarModule,
	isMarkdownPath,
	isVirtualDocsModule,
} from "../src/modules/plugin/domain/operations/build-virtual";

describe("isVirtualDocsModule / isMarkdownPath", () => {
	it("detects virtual:docs/*", () => {
		expect(isVirtualDocsModule("virtual:docs/data")).toBe(true);
		expect(isVirtualDocsModule("virtual:other")).toBe(false);
	});
	it("detects .md / .mdoc", () => {
		expect(isMarkdownPath("a.md")).toBe(true);
		expect(isMarkdownPath("a.mdoc")).toBe(true);
		expect(isMarkdownPath("a.txt")).toBe(false);
	});
});

describe("buildDocsDataModule", () => {
	it("emits a const", () => {
		const code = buildDocsDataModule([
			{
				id: "a" as never,
				slug: "a" as never,
				title: "A",
				description: "d",
				frontmatter: { title: "A" },
				content: "# A",
				rawContent: "",
				filePath: "/a.md" as never,
				order: 0,
				toc: [],
				metadata: { readingTime: 1, wordCount: 1 },
			},
		]);
		expect(code).toContain("export const docsData");
		expect(code).toContain('"a"');
		expect(code).toContain('"A"');
	});
});

describe("buildSidebar / buildNav / buildSearchIndex", () => {
	it("serialises to ESM", () => {
		expect(buildSidebarModule([{ title: "G", items: [] }])).toContain(
			"sidebar",
		);
		expect(buildNavModule([{ title: "S", items: [] }])).toContain("nav");
		expect(
			buildSearchIndexModule({ entries: [], inverted: {}, avgDocLength: 0 }),
		).toContain("searchIndex");
	});
});

describe("buildConfigModule", () => {
	it("emits all expected exports", () => {
		const code = buildConfigModule({
			docsDir: "docs",
			baseRoute: "/docs",
			site: { title: "T", description: "D" },
			nav: [],
			sidebar: [],
			theme: {},
			api: { baseUrl: "/api", authType: "bearer" },
			search: { enabled: true },
			editLink: { enabled: true },
			lastUpdated: { enabled: true },
		});
		for (const name of [
			"docsConfig",
			"site",
			"nav",
			"sidebar",
			"api",
			"search",
			"editLink",
			"lastUpdated",
		]) {
			expect(code).toContain(`export const ${name}`);
		}
	});
});
