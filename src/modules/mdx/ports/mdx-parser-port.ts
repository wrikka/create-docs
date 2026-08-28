/**
 * Port for MDX parsing operations.
 */

export type MdxParserPort = {
	/**
	 * Parse MDX string to component code.
	 */
	readonly parse: (raw: string, options?: unknown) => Promise<string>;

	/**
	 * Compile MDX to JavaScript.
	 */
	readonly compile: (raw: string, options?: unknown) => Promise<string>;
};
