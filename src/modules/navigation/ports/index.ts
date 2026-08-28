/**
 * Navigation module ports — interfaces to other modules (no I/O).
 */
import type { DocFile } from "@create-docs/modules/content";

/** Read access to the content module's scanned files. */
export interface ContentSource {
	readonly allFiles: () => readonly DocFile[];
}
