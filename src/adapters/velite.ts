/**
 * Velite Adapter
 *
 * Adapter layer for Velite content processing.
 * Wraps Velite's build function with framework-agnostic interface.
 *
 * ## Architecture
 * - Adapter Layer: I/O implementation for Velite
 * - No business logic, pure wrapper functions
 * - Framework-agnostic content API
 */

import { build } from "velite";

/**
 * Velite adapter options
 */
export interface VeliteAdapterOptions {
	/** Path to velite.config.ts file */
	configPath?: string;
	/** Watch mode for development */
	watch?: boolean;
}

/**
 * Velite build result
 */
export interface VeliteBuildResult {
	/** Success status */
	success: boolean;
	/** Error message if failed */
	error?: string;
	/** Output data directory */
	outputDir?: string;
	/** Assets output directory */
	assetsDir?: string;
}

/**
 * Create Velite adapter
 *
 * @param options - Adapter options
 * @returns Build function
 */
export const createVeliteAdapter = (options: VeliteAdapterOptions = {}) => {
	const { configPath = "velite.config.ts", watch = false } = options;

	/**
	 * Run Velite build
	 *
	 * @returns Build result
	 */
	const buildVelite = async (): Promise<VeliteBuildResult> => {
		try {
			const buildOptions: Parameters<typeof build>[0] = {
				config: configPath,
				watch,
			};

			await build(buildOptions);

			return {
				success: true,
				outputDir: ".velite",
				assetsDir: "public/static",
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	};

	return {
		build: buildVelite,
		configPath,
		watch,
	};
};

/**
 * Default Velite adapter instance
 */
export const defaultVeliteAdapter = createVeliteAdapter();

/**
 * Convenience function to build Velite content
 *
 * @param options - Build options
 * @returns Build result
 */
export const buildVelite = async (
	options: VeliteAdapterOptions = {},
): Promise<VeliteBuildResult> => {
	const adapter = createVeliteAdapter(options);
	return adapter.build();
};
