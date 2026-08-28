/**
 * Theme types for custom theme system.
 */

export type ThemeConfig = {
	readonly name: string;
	readonly colors: Readonly<Record<string, string>>;
	readonly fonts: Readonly<Record<string, string>>;
	readonly spacing: Readonly<Record<string, number>>;
};

export type ThemeVariant = "light" | "dark" | "auto";
