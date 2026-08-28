/**
 * Domain events — pure event types. No handlers, no I/O.
 * Handlers live in presentation/events.
 */
import type { DocPage, FilePath } from "../../types";

export type ContentEvent =
	| {
			readonly type: "content.discovered";
			readonly filePath: FilePath;
			readonly slug: string;
	  }
	| { readonly type: "content.parsed"; readonly page: DocPage }
	| { readonly type: "content.changed"; readonly filePath: FilePath }
	| {
			readonly type: "content.removed";
			readonly filePath: FilePath;
			readonly slug: string;
	  }
	| {
			readonly type: "content.parse_failed";
			readonly filePath: FilePath;
			readonly reason: string;
	  };

export const contentDiscovered = (
	filePath: FilePath,
	slug: string,
): ContentEvent => ({
	type: "content.discovered",
	filePath,
	slug,
});

export const contentParsed = (page: DocPage): ContentEvent => ({
	type: "content.parsed",
	page,
});

export const contentChanged = (filePath: FilePath): ContentEvent => ({
	type: "content.changed",
	filePath,
});

export const contentRemoved = (
	filePath: FilePath,
	slug: string,
): ContentEvent => ({
	type: "content.removed",
	filePath,
	slug,
});

export const contentParseFailed = (
	filePath: FilePath,
	reason: string,
): ContentEvent => ({
	type: "content.parse_failed",
	filePath,
	reason,
});
