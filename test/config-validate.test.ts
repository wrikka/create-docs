import { describe, expect, it } from "vitest";
import { defaultDocsConfig, resolveConfig } from "../src/modules/config";
import {
	validateDocsConfig,
	validateDocsConfigAll,
} from "../src/modules/config/domain/validators";
import {
	configError,
	fileNotFound,
	formatError,
	validationError,
} from "../src/shared/errors";

describe("resolveConfig", () => {
	it("applies defaults when no user config", () => {
		const r = resolveConfig();
		expect(r.docsDir).toBe("docs");
		expect(r.baseRoute).toBe("/docs");
		expect(r.site.title).toBe(defaultDocsConfig.site.title);
	});
	it("overrides with user values", () => {
		const r = resolveConfig({ site: { title: "X", description: "Y" } });
		expect(r.site.title).toBe("X");
	});
	it("merges nested options", () => {
		const r = resolveConfig({ theme: { primaryColor: "#000" } });
		expect(r.theme?.primaryColor).toBe("#000");
		expect(r.theme?.darkMode).toBe(true);
	});
});

describe("validateDocsConfig", () => {
	it("passes a valid config", () => {
		const r = validateDocsConfig(defaultDocsConfig);
		expect(r.ok).toBe(true);
	});
	it("rejects missing site.title", () => {
		const r = validateDocsConfig({
			...defaultDocsConfig,
			site: { ...defaultDocsConfig.site, title: "" },
		});
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.path).toBe("site.title");
		}
	});
	it("rejects invalid authType with suggestions", () => {
		const r = validateDocsConfig({
			...defaultDocsConfig,
			api: {
				baseUrl: "/api",
				authType: "magic" as never,
			},
		});
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.path).toBe("api.authType");
			expect(r.error.suggestions).toEqual(["bearer", "apiKey", "oauth2"]);
		}
	});
});

describe("validateDocsConfigAll", () => {
	it("returns ok for a valid config", () => {
		const r = validateDocsConfigAll(defaultDocsConfig);
		expect(r.ok).toBe(true);
	});
	it("collects multiple issues at once", () => {
		const r = validateDocsConfigAll({
			...defaultDocsConfig,
			site: { ...defaultDocsConfig.site, title: "", description: "" },
		});
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.issues.length).toBeGreaterThanOrEqual(2);
		}
	});
});

describe("formatError", () => {
	it("renders multi-line, includes path and hint", () => {
		const e = configError("Bad", {
			path: "api.baseUrl",
			suggestions: ["/api/v1"],
		});
		const out = formatError(e, false);
		expect(out).toContain("Bad");
		expect(out).toContain("path: api.baseUrl");
		expect(out).toContain("hint:");
		expect(out).toContain("/api/v1");
		expect(out).toContain("docs:");
	});
	it("emits ANSI when color=true", () => {
		const e = validationError("oops");
		const out = formatError(e, true);
		expect(out).toContain("\u001B[");
	});
	it("emits plain text when color=false", () => {
		const e = fileNotFound("/x");
		const out = formatError(e, false);
		expect(out).not.toContain("\u001B[");
		expect(out).toContain("File not found: /x");
	});
});
