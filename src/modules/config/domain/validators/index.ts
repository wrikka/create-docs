// Config Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { API_AUTH_TYPES } from "@create-docs/shared/constants";
import { type AppError, configError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { type } from "arktype";
import type { ApiEndpoint, DocsConfig } from "../../types";

/**
 * Site Schema
 */
export const siteSchema = type({
	title: "string >= 1",
	description: "string >= 1",
});

/**
 * API Schema
 */
export const apiSchema = type({
	baseUrl: "string >= 1",
	authType: type("'bearer' | 'apiKey' | 'oauth2'"),
});

/**
 * API Endpoint Schema
 */
export const apiEndpointSchema = type({
	method: type("'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'"),
	path: "string >= 1",
	description: "string >= 1",
});

export interface ValidationIssue {
	readonly path: string;
	readonly message: string;
	readonly hint?: string;
	readonly suggestions?: readonly string[];
}

const isNonEmptyString = (v: unknown): v is string =>
	typeof v === "string" && v.trim().length > 0;

const validateSite = (site: DocsConfig["site"]): ValidationIssue[] => {
	const issues: ValidationIssue[] = [];
	if (!isNonEmptyString(site.title)) {
		issues.push({
			path: "site.title",
			message: "must be a non-empty string",
		});
	}
	if (!isNonEmptyString(site.description)) {
		issues.push({
			path: "site.description",
			message: "must be a non-empty string",
		});
	}
	return issues;
};

const validateApi = (api: DocsConfig["api"]): ValidationIssue[] => {
	const issues: ValidationIssue[] = [];
	if (api === undefined) return issues;
	if (!isNonEmptyString(api.baseUrl)) {
		issues.push({
			path: "api.baseUrl",
			message: "must be a non-empty string",
		});
	}
	const authTypes = API_AUTH_TYPES as readonly string[];
	if (!authTypes.includes(api.authType)) {
		issues.push({
			path: "api.authType",
			message: `must be one of: ${API_AUTH_TYPES.join(", ")}`,
			suggestions: [...API_AUTH_TYPES],
		});
	}
	return issues;
};

export const validateSiteSchema = (
	s: DocsConfig["site"],
): Result<DocsConfig["site"], AppError> => {
	const issues = validateSite(s);
	if (issues.length === 0) return ok(s);
	const first = issues[0];
	return err(
		configError(first.message, {
			path: first.path,
			...(first.suggestions ? { suggestions: first.suggestions } : {}),
		}),
	);
};

export const validateApiSchema = (
	a: DocsConfig["api"],
): Result<DocsConfig["api"] | undefined, AppError> => {
	if (a === undefined) return ok(undefined);
	const issues = validateApi(a);
	if (issues.length === 0) return ok(a);
	const first = issues[0];
	return err(
		configError(first.message, {
			path: first.path,
			...(first.suggestions ? { suggestions: first.suggestions } : {}),
		}),
	);
};

export const validateApiEndpoint = (
	e: ApiEndpoint,
	path: string,
): Result<ApiEndpoint, AppError> => {
	const result = apiEndpointSchema(e);
	if (result instanceof type.errors) {
		return err(
			configError(result.summary, {
				path: `${path}`,
			}),
		);
	}
	return ok(e);
};

/** Collect all issues in one pass — returns every problem at once. */
export const validateDocsConfigAll = (
	c: DocsConfig,
): { ok: true } | { ok: false; issues: readonly ValidationIssue[] } => {
	const issues: ValidationIssue[] = [
		...validateSite(c.site),
		...validateApi(c.api),
	];
	if (issues.length > 0) return { ok: false, issues };
	return { ok: true };
};

export const validateDocsConfig = (
	c: DocsConfig,
): Result<DocsConfig, AppError> => {
	const all = validateDocsConfigAll(c);
	if (all.ok) return ok(c);
	const first = all.issues[0];
	if (!first) return ok(c);
	return err(
		configError(first.message, {
			path: first.path,
			...(first.suggestions ? { suggestions: first.suggestions } : {}),
			...(first.hint ? { context: { hint: first.hint } } : {}),
		}),
	);
};
