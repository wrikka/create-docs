/**
 * Use case: index all doc pages into a searchable structure.
 */

import type { DocPage } from "@create-docs/modules/content";
import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import { buildSearchIndex } from "../../domain/operations/buildIndex";
import type { SearchIndex } from "../../types";

export type IndexPages = (
	pages: readonly DocPage[],
) => Result<SearchIndex, AppError>;

export const indexPages: IndexPages = (pages) => ok(buildSearchIndex(pages));
