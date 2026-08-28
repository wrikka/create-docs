import type { ThemeConfig } from "../types/theme";

export type ThemePort = {
	readonly loadTheme: (
		themePath: string,
	) => Promise<Record<string, string> | string>;
	readonly applyTheme: (config?: ThemeConfig) => Promise<void>;
};
