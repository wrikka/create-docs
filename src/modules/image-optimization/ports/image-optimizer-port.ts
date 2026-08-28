/**
 * Port for image optimization operations.
 */

export type ImageOptimizerPort = {
	/**
	 * Optimize image with specified formats and widths.
	 */
	readonly optimize: (imagePath: string, config: unknown) => Promise<unknown>;

	/**
	 * Get image metadata.
	 */
	readonly getMetadata: (imagePath: string) => Promise<unknown>;
};
