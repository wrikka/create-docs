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
): LocaleChangedEvent => ({
	type: "LOCALE_CHANGED",
	timestamp: Date.now(),
	localeCode,
});

export const createTranslationLoadedEvent = (
	language: string,
): TranslationLoadedEvent => ({
	type: "TRANSLATION_LOADED",
	timestamp: Date.now(),
	language,
});
