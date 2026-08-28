import { describe, expect, it } from "vitest";
import {
	countWords,
	estimateReadingTime,
	extractGroup,
	extractOrder,
	extractTitle,
	extractToc,
	isMarkdownFile,
	parseFrontmatter,
	plainText,
	slugifyHeading,
	slugToId,
	stripMarkdownExt,
} from "../src/modules/content/domain/operations/parse";

describe("parseFrontmatter", () => {
	it("returns empty frontmatter when no delimiters", () => {
		const r = parseFrontmatter("# Hello");
		expect(r.frontmatter).toEqual({});
		expect(r.content).toBe("# Hello");
		expect(r.rawContent).toBe("# Hello");
	});

	it("returns empty frontmatter when only opening delimiter", () => {
		const r = parseFrontmatter("---\ntitle: Hi\n");
		expect(r.frontmatter).toEqual({});
	});

	it("parses scalar frontmatter", () => {
		const r = parseFrontmatter(
			"---\ntitle: Hello\norder: 5\ndraft: true\n---\n# Body",
		);
		expect(r.frontmatter.title).toBe("Hello");
		expect(r.frontmatter.order).toBe(5);
		expect(r.frontmatter.draft).toBe(true);
		expect(r.content).toBe("# Body");
	});

	it("parses inline arrays", () => {
		const r = parseFrontmatter('---\ntags: [a, b, "c d"]\n---\n');
		expect(r.frontmatter.tags).toEqual(["a", "b", "c d"]);
	});

	it("parses list arrays", () => {
		const r = parseFrontmatter("---\ntags:\n  - a\n  - b\n---\n");
		expect((r.frontmatter.tags as string[]).slice(0, 2)).toEqual(["a", "b"]);
	});

	it("strips quotes from scalar strings", () => {
		const r = parseFrontmatter('---\ntitle: "Quoted"\n---\n');
		expect(r.frontmatter.title).toBe("Quoted");
	});

	it("ignores comments and blank lines", () => {
		const r = parseFrontmatter("---\n# comment\n\ntitle: A\n---\n");
		expect(r.frontmatter.title).toBe("A");
	});
});

describe("extractTitle", () => {
	it("uses frontmatter title when present", () => {
		expect(extractTitle({ title: "Real" }, "guide/intro")).toBe("Real");
	});
	it("falls back to slug tail", () => {
		expect(extractTitle({}, "guide/intro")).toBe("intro");
	});
});

describe("extractOrder", () => {
	it("uses finite number", () => {
		expect(extractOrder({ order: 3 })).toBe(3);
	});
	it("falls back to default for missing", () => {
		expect(extractOrder({})).toBe(999);
	});
	it("falls back to default for non-finite", () => {
		expect(extractOrder({ order: Number.NaN })).toBe(999);
	});
});

describe("extractGroup", () => {
	it("returns undefined for top-level slug", () => {
		expect(extractGroup("intro")).toBeUndefined();
	});
	it("returns first segment for nested slug", () => {
		expect(extractGroup("guide/install")).toBe("guide");
	});
});

describe("slugToId", () => {
	it("replaces slashes with dashes", () => {
		expect(slugToId("guide/install")).toBe("guide-install");
	});
	it("strips leading dashes", () => {
		expect(slugToId("/intro")).toBe("intro");
	});
});

describe("isMarkdownFile / stripMarkdownExt", () => {
	it("detects .md", () => expect(isMarkdownFile("a.md")).toBe(true));
	it("detects .mdoc", () => expect(isMarkdownFile("a.mdoc")).toBe(true));
	it("rejects .txt", () => expect(isMarkdownFile("a.txt")).toBe(false));
	it("strips .md", () => expect(stripMarkdownExt("a.md")).toBe("a"));
	it("strips .mdoc", () => expect(stripMarkdownExt("a.mdoc")).toBe("a"));
});

describe("plainText", () => {
	it("strips code fences", () => {
		expect(plainText("```js\nconst x = 1\n```")).toBe("");
	});
	it("strips inline code", () => {
		expect(plainText("a `b` c")).toBe("a c");
	});
	it("expands link labels", () => {
		expect(plainText("[label](http://x)")).toBe("label");
	});
	it("strips headings and emphasis", () => {
		expect(plainText("# Title\n**bold** _em_")).toBe("Title bold em");
	});
});

describe("countWords", () => {
	it("counts whitespace-separated tokens", () => {
		expect(countWords("a b c d")).toBe(4);
	});
	it("returns 0 for empty", () => {
		expect(countWords("")).toBe(0);
	});
});

describe("estimateReadingTime", () => {
	it("rounds up at 220 wpm", () => {
		expect(estimateReadingTime(220)).toBe(1);
		expect(estimateReadingTime(500)).toBe(3);
	});
	it("clamps to at least 1 minute", () => {
		expect(estimateReadingTime(0)).toBe(1);
	});
});

describe("slugifyHeading", () => {
	it("lowercases and dashes", () => {
		expect(slugifyHeading("Hello World!")).toBe("hello-world");
	});
	it("returns 'section' for empty", () => {
		expect(slugifyHeading("---")).toBe("section");
	});
});

describe("extractToc", () => {
	it("captures h1–h6", () => {
		const toc = extractToc("# A\n## B\n### C\n#### D");
		expect(toc).toHaveLength(4);
		expect(toc[0]).toEqual({ id: "a", text: "A", depth: 1 });
		expect(toc[1]).toEqual({ id: "b", text: "B", depth: 2 });
	});
	it("deduplicates repeated headings", () => {
		const toc = extractToc("# Foo\n# Foo\n# Foo");
		expect(toc.map((t) => t.id)).toEqual(["foo", "foo-1", "foo-2"]);
	});
	it("returns empty for no headings", () => {
		expect(extractToc("paragraph only")).toEqual([]);
	});
	it("ignores empty headings", () => {
		expect(extractToc("# \n## ")).toEqual([]);
	});
});
