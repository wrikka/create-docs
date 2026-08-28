/**
 * Locale types for i18n support.
 */

export type Locale = string;

export type LocaleConfig = {
	readonly defaultLocale: Locale;
	readonly locales: readonly Locale[];
	readonly localePaths: Readonly<Record<Locale, string>>;
};

export type LocalizedDocPage = {
	readonly locale: Locale;
	readonly slug: string;
	readonly originalSlug: string;
};
