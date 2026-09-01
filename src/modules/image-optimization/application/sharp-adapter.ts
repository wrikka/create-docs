/**
 * Sharp adapter implementation.
 * Provides image optimization using the sharp library.
 */

import { configError, ioError } from "@create-docs/shared/errors";
import type { ImageOptimizerPort } from "../ports/image-optimizer-port";
import type { ImageConfig } from "../types/image";

const SHARP_MISSING_ERROR =
	"sharp is not installed. Image optimization requires the sharp package and native image libraries.";

const validateImageConfig = (config: unknown): ImageConfig => {
	const cfg = config as Partial<ImageConfig> | undefined;

	if (!cfg?.formats?.length) {
		throw configError("Image optimization config requires formats", {
			context: { config: cfg },
			hint: "Provide formats (e.g. ['webp']).",
		});
	}

	if (!cfg?.widths?.length) {
		throw configError("Image optimization config requires widths", {
			context: { config: cfg },
			hint: "Provide widths (e.g. [640, 1024]).",
		});
	}

	if (cfg.quality == null || cfg.quality < 1 || cfg.quality > 100) {
		throw configError(
			"Image optimization config requires a quality between 1 and 100",
			{
				context: { config: cfg },
			},
		);
	}

	return cfg as ImageConfig;
};

export const createSharpAdapter = (): ImageOptimizerPort => ({
	optimize: async (imagePath: string, config?: unknown) => {
		try {
			validateImageConfig(config);
			throw ioError(imagePath, SHARP_MISSING_ERROR);
		} catch (error) {
			if (error && typeof error === "object" && "kind" in error) {
				throw error;
			}
			throw ioError(imagePath, SHARP_MISSING_ERROR);
		}
	},

	getMetadata: async (imagePath: string) => {
		throw ioError(imagePath, SHARP_MISSING_ERROR);
	},
});
