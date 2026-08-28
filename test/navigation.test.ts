import { describe, expect, it } from "vitest";
import { buildDocPageFromRaw } from "../src/modules/content/application/usecases/load-doc-page";
import {
	buildNav,
	buildSidebar,
	formatGroupTitle,
	groupDocsByFolder,
} from "../src/modules/navigation";

const rawPage = (slug: string, body: string) => {
	const r = buildDocPageFromRaw(slug, `/x/${slug}.md`, body);
	if (!r.ok) throw new Error("bad page");
	return r.value;
};

describe("formatGroupTitle", () => {
	it("returns default for 'root'", () => {
		expect(formatGroupTitle("root")).toBe("Documentation");
	});
	it("title-cases kebab-case", () => {
		expect(formatGroupTitle("getting-started")).toBe("Getting Started");
	});
});

describe("groupDocsByFolder", () => {
	it("groups by first segment", () => {
		const pages = [
			rawPage("a/x", "---\ntitle: A\n---\n"),
			rawPage("a/y", "---\ntitle: Y\norder: 1\n---\n"),
			rawPage("b/z", "---\ntitle: Z\n---\n"),
		];
		const groups = groupDocsByFolder(pages);
		const titles = groups.map((g) => g.title);
		expect(titles).toContain("A");
		expect(titles).toContain("B");
	});
	it("sorts items by order", () => {
		const pages = [
			rawPage("a/b", "---\ntitle: B\norder: 2\n---\n"),
			rawPage("a/a", "---\ntitle: A\norder: 1\n---\n"),
		];
		const groups = groupDocsByFolder(pages);
		const items = groups[0]?.items ?? [];
		expect(items[0]?.title).toBe("A");
		expect(items[1]?.title).toBe("B");
	});
});

describe("buildSidebar", () => {
	it("uses configured when non-empty", () => {
		const r = buildSidebar({
			configured: [{ title: "Z", items: [{ title: "X", slug: "x" }] }],
		});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value[0]?.title).toBe("Z");
	});
	it("auto-generates from pages when no config", () => {
		const r = buildSidebar({
			pages: [
				rawPage("guide/a", "---\ntitle: A\n---\n"),
				rawPage("guide/b", "---\ntitle: B\n---\n"),
			],
		});
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.length).toBeGreaterThan(0);
			const group = r.value[0];
			expect(group?.items.length).toBe(2);
		}
	});
	it("returns empty when nothing provided", () => {
		const r = buildSidebar({});
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value).toEqual([]);
	});
});

describe("buildNav", () => {
	it("sorts sections by title", () => {
		const r = buildNav([
			{ title: "B", items: [{ label: "x" }] },
			{ title: "A", items: [{ label: "y" }] },
		]);
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value[0]?.title).toBe("A");
			expect(r.value[1]?.title).toBe("B");
		}
	});
});
