/**
 * Pure locale operations.
 * No I/O. No exceptions thrown.
 */

import type {
	Locale,
	LocaleConfig,
	LocalizedDocPage,
} from "../../types/locale";

/**
 * Extract locale from a slug path.
 * Example: "en/getting-started/introduction" -> "en"
 */
export const extractLocaleFromSlug = (
	slug: string,
	locales: readonly Locale[],
): Locale | null => {
	const parts = slug.split("/");
	const firstPart = parts[0];
	if (firstPart && locales.includes(firstPart)) {
		return firstPart;
	}
	return null;
};

/**
 * Remove locale prefix from a slug.
 * Example: "en/getting-started/introduction" -> "getting-started/introduction"
 */
export const removeLocaleFromSlug = (slug: string, locale: Locale): string => {
	return slug.startsWith(`${locale}/`) ? slug.slice(locale.length + 1) : slug;
};

/**
 * Add locale prefix to a slug.
 * Example: "getting-started/introduction" + "en" -> "en/getting-started/introduction"
 */
export const addLocaleToSlug = (slug: string, locale: Locale): string => {
	return `${locale}/${slug}`;
};

/**
 * Group doc pages by locale.
 */
export const groupDocsByLocale = (
	pages: readonly LocalizedDocPage[],
): Readonly<Record<Locale, readonly LocalizedDocPage[]>> => {
	const groups: Record<string, LocalizedDocPage[]> = {};
	for (const page of pages) {
		const { locale } = page;
		if (!groups[locale]) {
			groups[locale] = [];
		}
		groups[locale].push(page);
	}
	return groups;
};

/**
 * Validate locale config.
 */
export const validateLocaleConfig = (config: LocaleConfig): boolean => {
	if (!config.defaultLocale || !config.locales.includes(config.defaultLocale)) {
		return false;
	}
	for (const locale of config.locales) {
		if (!config.localePaths[locale]) {
			return false;
		}
	}
	return true;
};
