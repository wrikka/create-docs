/**
 * Domain models for i18n
 */
export interface Translation {
	readonly key: string;
	readonly value: string;
	readonly language: string;
}

export interface Locale {
	readonly code: string;
	readonly name: string;
	readonly rtl: boolean;
}

export const createTranslation = (
	key: string,
	value: string,
	language: string,
): Translation => ({
	key,
	value,
	language,
});

export const createLocale = (
	code: string,
	name: string,
	rtl: boolean = false,
): Locale => ({
	code,
	name,
	rtl,
});
