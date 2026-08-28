/**
 * CSS theme adapter implementation.
 * Provides CSS-based theme application.
 */

import { getCssVariables } from "../domain/operations/theme-operations";
import type { ThemePort } from "../ports/theme-port";
import type { ThemeConfig } from "../types/theme";

export const createCssThemeAdapter = (): ThemePort => ({
	loadTheme: async (themePath: string) => {
		if (typeof window === "undefined") {
			return {};
		}

		try {
			const response = await fetch(themePath);
			if (!response.ok) {
				throw new Error(`Failed to load theme: ${response.statusText}`);
			}
			const content = await response.text();
			return content;
		} catch (error) {
			console.error("Theme load error:", error);
			return {};
		}
	},

	applyTheme: async (config?: unknown) => {
		if (typeof window === "undefined") {
			return;
		}

		const themeConfig = config as ThemeConfig;
		if (!themeConfig) {
			return;
		}

		const cssVarsResult = getCssVariables(themeConfig);
		if (!cssVarsResult.ok) {
			console.error("Failed to get CSS variables:", cssVarsResult.error);
			return;
		}

		const root = document.documentElement;
		for (const [key, value] of Object.entries(cssVarsResult.value)) {
			root.style.setProperty(key, value);
		}
	},
});
