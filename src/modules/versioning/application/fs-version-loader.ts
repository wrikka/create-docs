/**
 * File system adapter for version loading.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { ioError } from "@create-docs/shared/errors";
import type { VersionLoaderPort } from "../ports/version-loader-port";

export const createFsVersionLoader = (): VersionLoaderPort => ({
	scanVersions: async (docsDir: string) => {
		try {
			const entries = await readdir(docsDir, { withFileTypes: true });
			return entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name);
		} catch (error) {
			throw ioError(docsDir, "Failed to scan versions", error);
		}
	},

	loadVersionDocs: async (version: string, docsDir: string) => {
		const versionDir = join(docsDir, version);
		try {
			const entries = await readdir(versionDir, {
				withFileTypes: true,
				recursive: true,
			});
			const results: string[] = [];
			for (const entry of entries) {
				if (
					entry.isFile() &&
					(entry.name.endsWith(".md") || entry.name.endsWith(".mdoc"))
				) {
					const parentPath = entry.parentPath || versionDir;
					results.push(join(parentPath, entry.name));
				}
			}
			return results;
		} catch (error) {
			throw ioError(versionDir, "Failed to load version docs", error);
		}
	},
});
