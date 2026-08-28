/**
 * Pure YAML 1.2 parser operations.
 * No I/O. No exceptions thrown. Returns Result types.
 */

import type { Result } from "@create-docs/shared/types";
import { err, ok } from "@create-docs/shared/types";
import { dump, JSON_SCHEMA, load, YAMLException } from "js-yaml";

export type YamlParseError = {
	readonly kind: "yaml-parse-error";
	readonly message: string;
	readonly line?: number;
	readonly column?: number;
};

/**
 * Parse YAML string with safe YAML 1.2 schema.
 */
export const parseYaml = (raw: string): Result<unknown, YamlParseError> => {
	try {
		const value = load(raw, { schema: JSON_SCHEMA });
		return ok(value);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		const line = error instanceof YAMLException ? error.mark?.line : undefined;
		const column =
			error instanceof YAMLException ? error.mark?.column : undefined;
		return err({
			kind: "yaml-parse-error",
			message,
			line,
			column,
		});
	}
};

/**
 * Stringify object to YAML.
 */
export const stringifyYaml = (
	value: unknown,
): Result<string, YamlParseError> => {
	try {
		const result = dump(value, {
			schema: JSON_SCHEMA,
			indent: 2,
			lineWidth: -1,
			noRefs: true,
		});
		return ok(result);
	} catch (error) {
		return err({
			kind: "yaml-parse-error",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
};
