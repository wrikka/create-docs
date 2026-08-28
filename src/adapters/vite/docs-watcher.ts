/**
 * Vite server-backed docs watcher.
 * Wires node:fs to the plugin's DocsWatcher port using the Vite dev server's
 * own file-watching facility.
 */
import * as fs from "node:fs/promises";
import type { DocsWatcher } from "@create-docs/modules/plugin";
import { SUPPORTED_EXTENSIONS } from "@create-docs/shared/constants";

export const createNodeDocsWatcher = (): DocsWatcher => ({
	watch(docsDir: string, onChange: (filePath: string) => void) {
		const ac = new AbortController();
		const iterator = fs
			.watch(docsDir, { recursive: true, signal: ac.signal } as fs.WatchOptions)
			[Symbol.asyncIterator]();
		const consume = async (): Promise<void> => {
			try {
				for await (const event of iterator) {
					const filename = (event as { filename?: unknown }).filename;
					if (typeof filename !== "string") return;
					if (!SUPPORTED_EXTENSIONS.some((ext) => filename.endsWith(ext)))
						return;
					onChange(filename);
				}
			} catch {
				// aborted — exit silently
			}
		};
		void consume();
		return {
			close: () => {
				ac.abort();
			},
		};
	},
});
