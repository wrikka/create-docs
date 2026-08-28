/**
 * Use case: select or fallback to the navigation structure.
 * Pure: depends only on config input.
 */

import type { AppError } from "@create-docs/shared/errors";
import { ok, type Result } from "@create-docs/shared/types/result";
import { sortNavSections } from "../../domain/operations/sort";
import type { NavSection } from "../../types";

export type BuildNav = (
	sections: readonly NavSection[],
) => Result<readonly NavSection[], AppError>;

export const buildNav: BuildNav = (sections) => ok(sortNavSections(sections));
