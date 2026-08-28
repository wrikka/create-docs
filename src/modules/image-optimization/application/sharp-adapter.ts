/**
 * Sharp adapter implementation.
 * Provides image optimization using sharp library.
 */

import { ioError } from "@create-docs/shared/errors";
import type { ImageOptimizerPort } from "../ports/image-optimizer-port";
import type { OptimizedImage } from "../types/image";

export const createSharpAdapter = (): ImageOptimizerPort => ({
	optimize: async (imagePath: string, _config?: unknown) => {
		try {
			console.log(
				"Sharp image optimization not yet implemented - requires sharp dependency",
			);
			console.log(`Image path: ${imagePath}`);
			return {
				src: imagePath,
				srcset: "",
				width: 0,
				height: 0,
				format: "unknown",
			} as OptimizedImage;
		} catch (error) {
			throw ioError(imagePath, "Failed to optimize image", error);
		}
	},

	getMetadata: async (imagePath: string) => {
		try {
			console.log(
				"Sharp metadata extraction not yet implemented - requires sharp dependency",
			);
			console.log(`Image path: ${imagePath}`);
			return {
				width: 0,
				height: 0,
				format: "unknown",
				size: 0,
			};
		} catch (error) {
			throw ioError(imagePath, "Failed to get image metadata", error);
		}
	},
});
