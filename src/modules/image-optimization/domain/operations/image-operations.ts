/**
 * Pure image optimization operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import type { ImageConfig, OptimizedImage } from "../../types/image";

export type ImageOptimizationError = {
	readonly kind: "image-optimization-error";
	readonly message: string;
};

/**
 * Generate srcset for responsive images.
 */
export const generateSrcset = (
	baseSrc: string,
	widths: readonly number[],
): string => {
	return widths.map((width) => `${baseSrc}?w=${width} ${width}w`).join(", ");
};

/**
 * Calculate aspect ratio from dimensions.
 */
export const calculateAspectRatio = (width: number, height: number): number => {
	return width / height;
};

/**
 * Validate image config.
 */
export const validateImageConfig = (config: ImageConfig): boolean => {
	if (config.formats.length === 0) return false;
	if (config.widths.length === 0) return false;
	if (config.quality < 0 || config.quality > 100) return false;
	return true;
};

/**
 * Process image metadata.
 */
export const processImageMetadata = (
	_metadata: unknown,
	_config: ImageConfig,
): Result<OptimizedImage, ImageOptimizationError> => {
	try {
		// This will be implemented via adapter
		// For now, return a basic optimized image
		return ok({
			src: "",
			srcset: "",
			width: 0,
			height: 0,
			format: "webp",
		});
	} catch (error) {
		return err({
			kind: "image-optimization-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
