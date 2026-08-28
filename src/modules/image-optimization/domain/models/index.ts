/**
 * Domain models for image optimization
 */
export interface ImageOptimization {
	readonly originalPath: string;
	readonly optimizedPath: string;
	readonly originalSize: number;
	readonly optimizedSize: number;
	readonly format: "webp" | "avif" | "png" | "jpg";
	readonly quality: number;
}

export const createImageOptimization = (
	originalPath: string,
	optimizedPath: string,
	originalSize: number,
	optimizedSize: number,
	format: ImageOptimization["format"],
	quality: number,
): ImageOptimization => ({
	originalPath,
	optimizedPath,
	originalSize,
	optimizedSize,
	format,
	quality,
});
