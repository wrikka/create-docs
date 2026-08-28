/**
 * File system adapter for locale loading.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { LocaleLoaderPort } from "../ports/locale-loader-port";

export const createFsLocaleLoader = (): LocaleLoaderPort => ({
	scanLocales: async (docsDir: string) => {
		try {
			const entries = await readdir(docsDir, { withFileTypes: true });
			return entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name);
		} catch {
			return [];
		}
	},

	loadLocaleDocs: async (locale: string, docsDir: string) => {
		try {
			const localeDir = join(docsDir, locale);
			const entries = await readdir(localeDir, {
				withFileTypes: true,
				recursive: true,
			});
			return entries
				.filter(
					(entry) =>
						entry.isFile() &&
						(entry.name.endsWith(".md") || entry.name.endsWith(".mdoc")),
				)
				.map((entry) => join(entry.parentPath, entry.name));
		} catch {
			return [];
		}
	},
});
