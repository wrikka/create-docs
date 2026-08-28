/**
 * Pure string utility functions.
 */

export const trim = (s: string): string => s.trim();

export const isBlank = (s: string): boolean => s.trim().length === 0;

export const isEmptyString = (s: string): boolean => s.length === 0;

export const startsWith = (s: string, prefix: string): boolean =>
	s.startsWith(prefix);

export const endsWith = (s: string, suffix: string): boolean =>
	s.endsWith(suffix);

export const stripPrefix = (s: string, prefix: string): string =>
	s.startsWith(prefix) ? s.slice(prefix.length) : s;

export const stripSuffix = (s: string, suffix: string): string =>
	s.endsWith(suffix) ? s.slice(0, -suffix.length) : s;

export const removeExtension = (s: string, ext: string): string =>
	stripSuffix(s, ext);

/** Replace all forward slashes and backslashes with the platform-agnostic `/`. */
export const toPosixPath = (s: string): string => s.replace(/\\/g, "/");

/** Strip a leading slash. */
export const stripLeadingSlash = (s: string): string =>
	s.startsWith("/") ? s.slice(1) : s;

/** Strip a trailing slash. */
export const stripTrailingSlash = (s: string): string =>
	s.endsWith("/") && s.length > 1 ? s.slice(0, -1) : s;

/** Capitalize the first character. */
export const capitalize = (s: string): string =>
	s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

/** Title-case each dash/underscore separated word. */
export const titleCase = (s: string): string =>
	s
		.split(/[-_\s]+/)
		.filter((w) => w.length > 0)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

export const slugify = (s: string): string =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");

export const truncate = (s: string, max: number, suffix = "..."): string =>
	s.length <= max
		? s
		: `${s.slice(0, Math.max(0, max - suffix.length))}${suffix}`;

export const splitLines = (s: string): string[] => s.split(/\r?\n/);

export const stripQuotes = (s: string): string => {
	const t = s.trim();
	if (
		(t.startsWith('"') && t.endsWith('"')) ||
		(t.startsWith("'") && t.endsWith("'"))
	) {
		return t.slice(1, -1);
	}
	return t;
};
