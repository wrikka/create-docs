import { describe, expect, it } from "vitest";
import {
	buildDocPage,
	buildEditUrl,
} from "../src/modules/content/domain/operations/build-page";
import { parseFrontmatter } from "../src/modules/content/domain/operations/parse";

describe("buildDocPage", () => {
	it("populates id/slug/title/order", () => {
		const page = buildDocPage({
			slug: "guide/intro",
			filePath: "/docs/guide/intro.md",
			parsed: parseFrontmatter("---\ntitle: Hi\norder: 2\n---\n# Body"),
		});
		expect(page.title).toBe("Hi");
		expect(page.order).toBe(2);
		expect(page.slug).toBe("guide/intro");
		expect(page.id).toBe("guide-intro");
		expect(page.group).toBe("guide");
	});

	it("populates toc and metadata with default reading time / word count", () => {
		const page = buildDocPage({
			slug: "guide/x",
			filePath: "/x.md",
			parsed: parseFrontmatter(
				"---\ntitle: T\n---\n# Heading\n\nSome text here with a few words to count.",
			),
		});
		expect(page.toc).toHaveLength(1);
		expect(page.toc[0]?.text).toBe("Heading");
		expect(page.metadata.readingTime).toBeGreaterThanOrEqual(1);
		expect(page.metadata.wordCount).toBeGreaterThan(0);
		expect(page.metadata.lastModified).toBeUndefined();
		expect(page.metadata.editUrl).toBeUndefined();
	});

	it("includes lastModified and editUrl when provided", () => {
		const page = buildDocPage({
			slug: "x",
			filePath: "/x.md",
			parsed: parseFrontmatter("---\ntitle: T\n---\n# A"),
			lastModifiedMs: 1_700_000_000_000,
			editUrl: "https://x/edit/main/x.md",
		});
		expect(page.metadata.lastModified).toBe("2023-11-14T22:13:20.000Z");
		expect(page.metadata.editUrl).toBe("https://x/edit/main/x.md");
	});

	it("uses description from frontmatter when present", () => {
		const page = buildDocPage({
			slug: "x",
			filePath: "/x.md",
			parsed: parseFrontmatter("---\ntitle: T\ndescription: d\n---\n# A"),
		});
		expect(page.description).toBe("d");
	});

	it("omits description when not set", () => {
		const page = buildDocPage({
			slug: "x",
			filePath: "/x.md",
			parsed: parseFrontmatter("---\ntitle: T\n---\n# A"),
		});
		expect(page.description).toBeUndefined();
	});
});

describe("buildEditUrl", () => {
	it("returns undefined when disabled", () => {
		expect(buildEditUrl("/docs/x.md", { enabled: false })).toBeUndefined();
	});
	it("returns undefined when baseUrl missing", () => {
		expect(buildEditUrl("/docs/x.md", { branch: "main" })).toBeUndefined();
	});
	it("joins baseUrl + branch + tail when enabled", () => {
		expect(
			buildEditUrl("docs/x.md", {
				enabled: true,
				baseUrl: "https://github.com/me/repo",
				branch: "main",
			}),
		).toBe("https://github.com/me/repo/edit/main/x.md");
	});
	it("strips leading 'docs/' from tail", () => {
		expect(
			buildEditUrl("docs/sub/x.md", {
				enabled: true,
				baseUrl: "https://github.com/me/repo",
				branch: "main",
			}),
		).toBe("https://github.com/me/repo/edit/main/sub/x.md");
	});
});
