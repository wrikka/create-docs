/**
 * Port for YAML parsing operations.
 * Defines the interface for YAML adapter implementations.
 */

export type YamlParserPort = {
	/**
	 * Parse YAML string with full YAML 1.2 support.
	 * Safe mode enabled - no eval, no function scalars.
	 */
	readonly parse: (raw: string) => Promise<unknown>;

	/**
	 * Stringify object to YAML with full YAML 1.2 support.
	 * Safe mode enabled - no eval, no function scalars.
	 */
	readonly stringify: (value: unknown) => Promise<string>;
};
