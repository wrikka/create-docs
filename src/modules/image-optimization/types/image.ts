/**
 * Image optimization types for image processing pipeline.
 */

export type ImageConfig = {
	readonly formats: readonly ("webp" | "avif" | "jpeg" | "png")[];
	readonly widths: readonly number[];
	readonly quality: number;
};

export type OptimizedImage = {
	readonly src: string;
	readonly srcset: string;
	readonly width: number;
	readonly height: number;
	readonly format: string;
};
