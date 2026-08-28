/**
 * Domain error types — tagged unions for typed failures.
 *
 * Each module can extend this with its own error variants, but
 * all errors should flow through these base types at boundaries.
 */

export type AppErrorKind =
	| "file_not_found"
	| "parse_error"
	| "validation_error"
	| "config_error"
	| "io_error"
	| "plugin_error";

export interface AppError {
	readonly kind: AppErrorKind;
	readonly message: string;
	readonly cause?: unknown;
	readonly context?: Readonly<Record<string, unknown>>;
	/** JSON-pointer-like path to the offending field (e.g. "site.title"). */
	readonly path?: string;
	/** Actionable hint shown to the user (e.g. allowed values). */
	readonly hint?: string;
	/** Documentation URL related to this error. */
	readonly docsUrl?: string;
	/** Allowed values, for inline suggestions. */
	readonly suggestions?: readonly string[];
}

const DOCS_BASE = "https://create-docs.dev/errors";

export const makeError = (
	kind: AppErrorKind,
	message: string,
	options?: {
		cause?: unknown;
		context?: Record<string, unknown>;
		path?: string;
		hint?: string;
		suggestions?: readonly string[];
	},
): AppError => {
	const base: {
		kind: AppErrorKind;
		message: string;
		cause?: unknown;
		context?: Readonly<Record<string, unknown>>;
		path?: string;
		hint?: string;
		suggestions?: readonly string[];
		docsUrl: string;
	} = {
		kind,
		message,
		docsUrl: `${DOCS_BASE}/${kind.replace(/_/g, "-")}`,
	};
	if (options?.cause !== undefined) base.cause = options.cause;
	if (options?.context !== undefined) base.context = options.context;
	if (options?.path !== undefined) base.path = options.path;
	if (options?.hint !== undefined) base.hint = options.hint;
	if (options?.suggestions !== undefined)
		base.suggestions = options.suggestions;
	return base;
};

export const fileNotFound = (path: string, cause?: unknown): AppError =>
	makeError("file_not_found", `File not found: ${path}`, {
		cause,
		context: { path },
		hint: "Check that the docsDir option points to an existing directory.",
	});

export const parseError = (
	path: string,
	message: string,
	cause?: unknown,
): AppError =>
	makeError("parse_error", message, {
		cause,
		context: { path },
		hint: "Verify the frontmatter is delimited by '---' on its own line.",
	});

export const validationError = (
	message: string,
	options?: {
		path?: string;
		suggestions?: readonly string[];
		context?: Record<string, unknown>;
	},
): AppError => {
	const ctx = options?.context ?? {};
	if (options?.path !== undefined) ctx.path = options.path;
	return makeError("validation_error", message, {
		context: ctx,
		path: options?.path,
		suggestions: options?.suggestions,
		hint: options?.suggestions?.length
			? `Did you mean one of: ${options.suggestions.join(", ")}?`
			: undefined,
	});
};

export const configError = (
	message: string,
	options?: {
		path?: string;
		suggestions?: readonly string[];
		context?: Record<string, unknown>;
	},
): AppError => {
	const ctx = options?.context ?? {};
	if (options?.path !== undefined) ctx.path = options.path;
	return makeError("config_error", message, {
		context: ctx,
		path: options?.path,
		suggestions: options?.suggestions,
		hint: options?.suggestions?.length
			? `Allowed: ${options.suggestions.join(", ")}.`
			: "See https://create-docs.dev/docs/configuration for the full schema.",
	});
};

export const ioError = (
	path: string,
	message: string,
	cause?: unknown,
): AppError => makeError("io_error", message, { cause, context: { path } });

export const pluginError = (
	message: string,
	options?: {
		path?: string;
		hint?: string;
		context?: Record<string, unknown>;
	},
): AppError => {
	const ctx = options?.context ?? {};
	if (options?.path !== undefined) ctx.path = options.path;
	return makeError("plugin_error", message, {
		context: ctx,
		path: options?.path,
		hint: options?.hint,
	});
};

const RED = "\u001B[31m";
const YELLOW = "\u001B[33m";
const CYAN = "\u001B[36m";
const DIM = "\u001B[2m";
const RESET = "\u001B[0m";
const BOLD = "\u001B[1m";

const isColorSupported = (): boolean => {
	if (typeof process === "undefined") return false;
	const env = process.env;
	if (env?.NO_COLOR && env.NO_COLOR.length > 0) return false;
	if (env?.FORCE_COLOR && env.FORCE_COLOR.length > 0) return true;
	return Boolean(process.stdout?.isTTY);
};

/** Format an AppError as a multi-line, ANSI-coloured, actionable message. */
export const formatError = (
	e: AppError,
	color = isColorSupported(),
): string => {
	const c = (code: string, s: string): string =>
		color ? `${code}${s}${RESET}` : s;
	const lines: string[] = [];
	lines.push(`${c(BOLD + RED, "✖")} ${c(BOLD, e.message)}`);
	lines.push(`  ${c(DIM, "kind:")} ${e.kind}`);
	if (e.path) lines.push(`  ${c(DIM, "path:")} ${e.path}`);
	if (e.suggestions && e.suggestions.length > 0) {
		lines.push(
			`  ${c(DIM, "allowed:")} ${e.suggestions.map((s) => c(CYAN, s)).join(", ")}`,
		);
	}
	if (e.hint) lines.push(`  ${c(YELLOW, "hint:")} ${e.hint}`);
	if (e.docsUrl) lines.push(`  ${c(DIM, "docs:")} ${c(CYAN, e.docsUrl)}`);
	if (e.context && Object.keys(e.context).length > 0) {
		lines.push(`  ${c(DIM, "context:")} ${JSON.stringify(e.context)}`);
	}
	if (e.cause !== undefined) {
		lines.push(`  ${c(DIM, "cause:")} ${String(e.cause)}`);
	}
	return lines.join("\n");
};
