/**
 * Polling-based watcher fallback.
 *
 * `fs.watch` with `recursive: true` is unreliable on Linux (inotify misses
 * sub-directory events until a file is touched). This walker periodically
 * diffs the directory tree and emits change events for any file whose mtime
 * or presence has changed since the last scan.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { SUPPORTED_EXTENSIONS } from "@create-docs/shared/constants";

export interface PollingWatcherOptions {
	readonly intervalMs?: number;
}

interface FileSnapshot {
	readonly mtimeMs: number;
	readonly size: number;
}

const isSupported = (name: string): boolean =>
	SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));

const snapshotDir = async (dir: string): Promise<Map<string, FileSnapshot>> => {
	const out = new Map<string, FileSnapshot>();
	const walk = async (current: string): Promise<void> => {
		let entries: import("node:fs").Dirent[];
		try {
			entries = await fs.readdir(current, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
			} else if (entry.isFile() && isSupported(entry.name)) {
				try {
					const s = await fs.stat(full);
					out.set(full, { mtimeMs: s.mtimeMs, size: s.size });
				} catch {
					// file vanished between readdir and stat - ignore
				}
			}
		}
	};
	await walk(dir);
	return out;
};

export const createPollingWatcher = (
	opts: PollingWatcherOptions = {},
): {
	watch: (
		dir: string,
		onChange: (filePath: string) => void,
	) => { close: () => void };
} => {
	const interval = opts.intervalMs ?? 300;
	return {
		watch(dir, onChange) {
			let stopped = false;
			let prev: Promise<Map<string, FileSnapshot>> = snapshotDir(dir);
			const tick = async (): Promise<void> => {
				if (stopped) return;
				const next = await snapshotDir(dir);
				const before = await prev;
				for (const [file, snap] of next) {
					const old = before.get(file);
					if (!old || old.mtimeMs !== snap.mtimeMs || old.size !== snap.size) {
						onChange(file);
					}
				}
				for (const file of before.keys()) {
					if (!next.has(file)) onChange(file);
				}
				prev = Promise.resolve(next);
				if (!stopped) setTimeout(tick, interval);
			};
			void tick();
			return {
				close: () => {
					stopped = true;
				},
			};
		},
	};
};
