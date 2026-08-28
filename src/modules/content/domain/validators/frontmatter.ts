// Content Domain Schemas - Arktype validation schemas
// Following /follow-arktype workflow for type-safe runtime validation

import { BADGE_VARIANTS } from "@create-docs/shared/constants";
import { validationError } from "@create-docs/shared/errors";
import { err, ok, type Result } from "@create-docs/shared/types/result";
import { type } from "arktype";
import type { BadgeVariant, Frontmatter } from "../../types";

/**
 * Badge Variant Schema
 */
export const badgeVariantSchema = type(
	"'default' | 'primary' | 'success' | 'warning' | 'danger'",
);

export type BadgeVariantSchema = typeof badgeVariantSchema.infer;

/**
 * Title Schema
 */
export const titleSchema = type("string").narrow(
	(title: string) => title.trim().length > 0,
);

/**
 * Order Schema
 */
export const orderSchema = type("number").narrow((order: number) =>
	Number.isFinite(order),
);

export const validateBadgeVariant = (
	v: unknown,
): Result<BadgeVariant | undefined, ReturnType<typeof validationError>> => {
	if (v === undefined) return ok(undefined);
	const result = badgeVariantSchema(v);
	if (result instanceof type.errors) {
		return err(
			validationError("Invalid badge variant", {
				suggestions: [...BADGE_VARIANTS],
			}),
		);
	}
	return ok(v as BadgeVariant);
};

export const validateTitle = (
	f: Frontmatter,
): Result<string | undefined, ReturnType<typeof validationError>> => {
	const t = f.title;
	if (t === undefined) return ok(undefined);
	const result = titleSchema(t);
	if (result instanceof type.errors) {
		return err(validationError("Title must be a non-empty string"));
	}
	return ok(t);
};

export const validateOrder = (
	f: Frontmatter,
): Result<number | undefined, ReturnType<typeof validationError>> => {
	const o = f.order;
	if (o === undefined) return ok(undefined);
	const result = orderSchema(o);
	if (result instanceof type.errors) {
		return err(validationError("Order must be a finite number"));
	}
	return ok(o);
};

export const validateFrontmatter = (
	f: Frontmatter,
): Result<Frontmatter, ReturnType<typeof validationError>> => {
	const titleResult = validateTitle(f);
	if (!titleResult.ok) return titleResult;
	const orderResult = validateOrder(f);
	if (!orderResult.ok) return orderResult;
	const badgeResult = validateBadgeVariant(f.badgeVariant);
	if (!badgeResult.ok) return badgeResult;
	return ok(f);
};
