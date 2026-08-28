/**
 * js-yaml adapter implementation.
 * Provides full YAML 1.2 support with safe mode.
 */

import { ioError, parseError } from "@create-docs/shared/errors";
import yaml from "js-yaml";
import type { YamlParserPort } from "../ports/yaml-parser-port";

export const createJsYamlAdapter = (): YamlParserPort => ({
	parse: async (raw: string) => {
		try {
			return yaml.load(raw, {
				schema: yaml.DEFAULT_SCHEMA,
				// Safe mode - no eval, no function scalars
			});
		} catch (error) {
			throw parseError("<input>", "YAML parsing failed", error);
		}
	},

	stringify: async (value: unknown) => {
		try {
			return yaml.dump(value, {
				schema: yaml.DEFAULT_SCHEMA,
				indent: 2,
				lineWidth: -1,
				noRefs: true,
			});
		} catch (error) {
			throw ioError("<output>", "YAML stringification failed", error);
		}
	},
});
