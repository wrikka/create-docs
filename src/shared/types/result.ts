/**
 * Result<T, E> — A pure algebraic data type for synchronous operations
 * that can fail with a typed error.
 *
 * Use this over throwing exceptions at the boundaries (domain, application).
 * Domain must never throw — only return Result.
 *
 * @example
 *   const divide = (a: number, b: number): Result<number, string> =>
 *     b === 0 ? err('Division by zero') : ok(a / b);
 */
export type Result<T, E> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; value: T } =>
	r.ok;

export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } =>
	!r.ok;

export const map = <T, U, E>(
	r: Result<T, E>,
	fn: (value: T) => U,
): Result<U, E> => (r.ok ? ok(fn(r.value)) : r);

export const mapErr = <T, E, F>(
	r: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> => (r.ok ? r : err(fn(r.error)));

export const flatMap = <T, U, E>(
	r: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => (r.ok ? fn(r.value) : r);

export const unwrap = <T, E>(r: Result<T, E>): T => {
	if (r.ok) return r.value;
	throw new Error(`unwrap on Err: ${String(r.error)}`);
};

export const unwrapOr = <T, E>(r: Result<T, E>, fallback: T): T =>
	r.ok ? r.value : fallback;

export const fromThrowable = <T, E = Error>(
	fn: () => T,
	onError: (e: unknown) => E,
): Result<T, E> => {
	try {
		return ok(fn());
	} catch (e) {
		return err(onError(e));
	}
};

export const all = <T, E>(
	results: readonly Result<T, E>[],
): Result<readonly T[], E> => {
	const values: T[] = [];
	for (const r of results) {
		if (!r.ok) return r;
		values.push(r.value);
	}
	return ok(values);
};

export const partition = <T, E>(
	results: readonly Result<T, E>[],
): { ok: readonly T[]; err: readonly E[] } => {
	const okValues: T[] = [];
	const errValues: E[] = [];
	for (const r of results) {
		if (r.ok) okValues.push(r.value);
		else errValues.push(r.error);
	}
	return { ok: okValues, err: errValues };
};
