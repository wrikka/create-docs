/**
 * @mdx-js/mdx adapter implementation.
 * Provides MDX parsing and compilation.
 */

import { pluginError } from "@create-docs/shared/errors";
import { compile } from "@mdx-js/mdx";
import type { MdxParserPort } from "../ports/mdx-parser-port";

export const createMdxJsAdapter = (): MdxParserPort => ({
	parse: async (raw: string, options?: unknown) => {
		try {
			const result = await compile(raw, {
				...(options as Record<string, unknown>),
				outputFormat: "function-body",
			});
			return result.toString();
		} catch (error) {
			throw pluginError("MDX parsing failed", {
				context: { options, error: String(error) },
			});
		}
	},

	compile: async (raw: string, options?: unknown) => {
		try {
			const result = await compile(raw, {
				...(options as Record<string, unknown>),
				outputFormat: "function-body",
			});
			return result.toString();
		} catch (error) {
			throw pluginError("MDX compilation failed", {
				context: { options, error: String(error) },
			});
		}
	},
});
