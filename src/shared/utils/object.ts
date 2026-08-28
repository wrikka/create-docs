/**
 * Pure object utility functions. No mutation of inputs.
 */

export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === "object" && v !== null && !Array.isArray(v);

export const isString = (v: unknown): v is string => typeof v === "string";

export const isNumber = (v: unknown): v is number =>
	typeof v === "number" && !Number.isNaN(v);

export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

export const isArray = Array.isArray as <T>(v: unknown) => v is T[];

export const isNonEmptyString = (v: unknown): v is string =>
	isString(v) && v.length > 0;

export const isNonEmptyArray = <T>(
	v: readonly T[],
): v is readonly [T, ...T[]] => v.length > 0;

export const keys = <T extends object>(o: T): readonly (keyof T)[] =>
	Object.keys(o) as (keyof T)[];

export const pick = <T extends object, K extends keyof T>(
	o: T,
	ks: readonly K[],
): Pick<T, K> => {
	const out = {} as Pick<T, K>;
	for (const k of ks) {
		if (k in o) out[k] = o[k];
	}
	return out;
};

export const omit = <T extends object, K extends keyof T>(
	o: T,
	ks: readonly K[],
): Omit<T, K> => {
	const out = { ...o };
	for (const k of ks) {
		delete out[k];
	}
	return out;
};
