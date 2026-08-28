import { describe, expect, it } from "vitest";
import type { DocPage } from "../src/modules/content";
import { buildDocPage } from "../src/modules/content/domain/operations/build-page";
import { parseFrontmatter } from "../src/modules/content/domain/operations/parse";
import {
	buildSearchIndex,
	tokenize,
} from "../src/modules/search/domain/operations/build-index";
import {
	levenshtein,
	search,
} from "../src/modules/search/domain/operations/query";

const mkPage = (slug: string, title: string, body: string): DocPage =>
	buildDocPage({
		slug,
		filePath: `/docs/${slug}.md`,
		parsed: parseFrontmatter(`---\ntitle: ${title}\n---\n${body}`),
	});

describe("tokenize", () => {
	it("lowercases and strips punctuation", () => {
		expect(tokenize("Hello, World!").slice(0, 2)).toEqual(["hello", "world"]);
	});
	it("strips diacritics", () => {
		expect(tokenize("café résumé")).toEqual(["cafe", "resume"]);
	});
	it("skips very short tokens", () => {
		expect(tokenize("a b cat")).toEqual(["cat"]);
	});
});

describe("buildSearchIndex", () => {
	it("builds inverted index and avgDocLength", () => {
		const pages = [
			mkPage("a", "Alpha", "first page about installation"),
			mkPage("b", "Beta", "configuration guide"),
		];
		const idx = buildSearchIndex(pages);
		expect(idx.entries).toHaveLength(2);
		expect(Object.keys(idx.inverted).length).toBeGreaterThan(0);
		expect(idx.avgDocLength).toBeGreaterThan(0);
	});
});

describe("search", () => {
	const pages = [
		mkPage(
			"a",
			"Authentication Guide",
			"How to authenticate with bearer tokens",
		),
		mkPage("b", "Configuration", "Settings for the application"),
		mkPage("c", "Installation", "Install via npm or yarn"),
	];
	const idx = buildSearchIndex(pages);

	it("returns empty for empty term", () => {
		expect(search(idx, { term: "" })).toEqual([]);
	});
	it("matches exact term via inverted index", () => {
		const hits = search(idx, { term: "authentication" });
		expect(hits.length).toBeGreaterThan(0);
		expect(hits[0]?.entry.slug).toBe("a");
	});
	it("boosts title match", () => {
		const hits = search(idx, { term: "configuration" });
		expect(hits[0]?.entry.slug).toBe("b");
	});
	it("fuzzy matches typos within distance 2", () => {
		const hits = search(idx, { term: "authentcat" });
		expect(hits.length).toBeGreaterThan(0);
		expect(hits[0]?.entry.slug).toBe("a");
	});
	it("respects limit", () => {
		const hits = search(idx, { term: "a", limit: 1 });
		expect(hits.length).toBeLessThanOrEqual(1);
	});
});

describe("levenshtein", () => {
	it("returns 0 for identical", () => {
		expect(levenshtein("abc", "abc")).toBe(0);
	});
	it("returns distance for different", () => {
		expect(levenshtein("abc", "abd")).toBe(1);
		expect(levenshtein("abc", "xyz")).toBe(3);
	});
	it("terminates early when row min exceeds max", () => {
		expect(levenshtein("abc", "xyz", 2)).toBe(3);
	});
	it("handles fuzz scenarios", () => {
		// a-u-t-h-e-n-t-i-c-a-t-e
		// a-u-t-h-e-n-t-c-a-t
		// delete 'i' and 'e' = 2
		expect(levenshtein("authenticate", "authentcat", 2)).toBeLessThanOrEqual(2);
	});
});
