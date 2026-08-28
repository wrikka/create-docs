import { describe, expect, it } from "vitest";
import {
	makeCacheKey,
	ParseCache,
} from "../src/modules/content/application/cache/parse-cache";

describe("makeCacheKey", () => {
	it("includes mtime and size", () => {
		expect(makeCacheKey("/x.md", { mtimeMs: 100, size: 5 })).toBe(
			"/x.md@100:5",
		);
	});
	it("differs when stat changes", () => {
		const a = makeCacheKey("/x.md", { mtimeMs: 100, size: 5 });
		const b = makeCacheKey("/x.md", { mtimeMs: 101, size: 5 });
		expect(a).not.toBe(b);
	});
});

describe("ParseCache", () => {
	it("stores and retrieves by key", () => {
		const c = new ParseCache<string>(10);
		c.set("k", "v");
		expect(c.get("k")).toBe("v");
		expect(c.has("k")).toBe(true);
		expect(c.size).toBe(1);
	});
	it("evicts oldest when over capacity", () => {
		const c = new ParseCache<string>(2);
		c.set("a", "1");
		c.set("b", "2");
		c.set("c", "3");
		expect(c.has("a")).toBe(false);
		expect(c.has("b")).toBe(true);
		expect(c.has("c")).toBe(true);
	});
	it("clears", () => {
		const c = new ParseCache<string>(10);
		c.set("a", "1");
		c.clear();
		expect(c.size).toBe(0);
	});
});
