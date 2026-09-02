/**
 * Domain events for i18n
 */
export interface LocaleChangedEvent {
	readonly type: "LOCALE_CHANGED";
	readonly timestamp: number;
	readonly localeCode: string;
}

export interface TranslationLoadedEvent {
	readonly type: "TRANSLATION_LOADED";
	readonly timestamp: number;
	readonly language: string;
}

export type I18nDomainEvent = LocaleChangedEvent | TranslationLoadedEvent;

export const createLocaleChangedEvent = (
	localeCode: string,
	now: number = Date.now(),
): LocaleChangedEvent => ({
	type: "LOCALE_CHANGED",
	timestamp: now,
	localeCode,
});

export const createTranslationLoadedEvent = (
	language: string,
	now: number = Date.now(),
): TranslationLoadedEvent => ({
	type: "TRANSLATION_LOADED",
	timestamp: now,
	language,
});
