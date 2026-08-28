/**
 * Pure theme operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { ThemeConfig, ThemeVariant } from "../../types/theme";

export type ThemeError = {
	readonly kind: "theme-error";
	readonly message: string;
};

/**
 * Validate theme config.
 */
export const validateThemeConfig = (config: ThemeConfig): boolean => {
	if (!config.name) return false;
	if (!config.colors || Object.keys(config.colors).length === 0) return false;
	return true;
};

/**
 * Get CSS variables from theme config.
 */
export const getCssVariables = (
	config: ThemeConfig,
): Result<Record<string, string>, ThemeError> => {
	try {
		const variables: Record<string, string> = {};

		for (const [key, value] of Object.entries(config.colors)) {
			variables[`--color-${key}`] = value;
		}

		for (const [key, value] of Object.entries(config.spacing)) {
			variables[`--spacing-${key}`] = `${value}px`;
		}

		return ok(variables);
	} catch (error) {
		return err({
			kind: "theme-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

/**
 * Apply theme variant.
 */
export const applyThemeVariant = (
	config: ThemeConfig,
	variant: ThemeVariant,
): ThemeConfig => {
	if (variant === "dark") {
		return {
			...config,
			colors: {
				...config.colors,
				background: "#1a1a1a",
				foreground: "#ffffff",
			},
		};
	}
	return config;
};
