/**
 * Workflow: validate a config and return it (or fail).
 * Pure — no I/O.
 */

import type { AppError } from "@create-docs/shared/errors";
import type { Result } from "@create-docs/shared/types/result";
import { validateDocsConfig } from "../../domain/validators";
import type { DocsConfig } from "../../types";

export type ValidateConfig = (c: DocsConfig) => Result<DocsConfig, AppError>;

export const validateConfig: ValidateConfig = (c) =>
	validateDocsConfig(c) as Result<DocsConfig, AppError>;
