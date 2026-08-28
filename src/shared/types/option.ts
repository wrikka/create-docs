/**
 * Option<T> — A pure algebraic data type for values that may be absent.
 *
 * Use this to model nullable values without `null | undefined` leakage.
 *
 * @example
 *   const findUser = (id: string): Option<User> =>
 *     users.has(id) ? some(users.get(id)!) : none;
 */
export type Option<T> =
	| { readonly kind: "some"; readonly value: T }
	| { readonly kind: "none" };

export const some = <T>(value: T): Option<T> => ({ kind: "some", value });

export const none = <T = never>(): Option<T> => ({ kind: "none" });

export const isSome = <T>(o: Option<T>): o is { kind: "some"; value: T } =>
	o.kind === "some";

export const isNone = <T>(o: Option<T>): o is { kind: "none" } =>
	o.kind === "none";

export const map = <T, U>(o: Option<T>, fn: (value: T) => U): Option<U> =>
	o.kind === "some" ? some(fn(o.value)) : o;

export const flatMap = <T, U>(
	o: Option<T>,
	fn: (value: T) => Option<U>,
): Option<U> => (o.kind === "some" ? fn(o.value) : o);

export const filter = <T>(
	o: Option<T>,
	pred: (value: T) => boolean,
): Option<T> => (o.kind === "some" && pred(o.value) ? o : none());

export const orElse = <T>(o: Option<T>, fallback: Option<T>): Option<T> =>
	o.kind === "some" ? o : fallback;

export const getOrElse = <T>(o: Option<T>, fallback: T): T =>
	o.kind === "some" ? o.value : fallback;

export const toNullable = <T>(o: Option<T>): T | null =>
	o.kind === "some" ? o.value : null;

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
	value === null || value === undefined ? none() : some(value);

export const fromPredicate = <T>(
	value: T,
	pred: (v: T) => boolean,
): Option<T> => (pred(value) ? some(value) : none());
