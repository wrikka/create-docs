/**
 * Either<L, R> — A pure algebraic data type for a value that can be one of two types.
 *
 * Convention: L = "left" (often an error/short-circuit), R = "right" (success/continuation).
 *
 * Use this when you need to model two valid outcomes (e.g., a value OR a reason it isn't applicable)
 * without committing to Result's "err" semantics.
 */
export type Either<L, R> =
	| { readonly tag: "left"; readonly left: L }
	| { readonly tag: "right"; readonly right: R };

export const left = <L>(value: L): Either<L, never> => ({
	tag: "left",
	left: value,
});

export const right = <R>(value: R): Either<never, R> => ({
	tag: "right",
	right: value,
});

export const isLeft = <L, R>(e: Either<L, R>): e is { tag: "left"; left: L } =>
	e.tag === "left";

export const isRight = <L, R>(
	e: Either<L, R>,
): e is { tag: "right"; right: R } => e.tag === "right";

export const map = <L, R, R2>(
	e: Either<L, R>,
	fn: (right: R) => R2,
): Either<L, R2> => (e.tag === "right" ? right(fn(e.right)) : e);

export const mapLeft = <L, L2, R>(
	e: Either<L, R>,
	fn: (left: L) => L2,
): Either<L2, R> => (e.tag === "left" ? left(fn(e.left)) : e);
