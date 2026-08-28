/**
 * Pure array utility functions. No mutation, no side effects.
 * All functions are total — they handle empty arrays gracefully.
 */

export const isEmpty = <T>(arr: readonly T[]): boolean => arr.length === 0;

export const first = <T>(arr: readonly T[]): T | undefined => arr[0];

export const last = <T>(arr: readonly T[]): T | undefined =>
	arr[arr.length - 1];

export const unique = <T>(arr: readonly T[]): T[] => Array.from(new Set(arr));

export const uniqueBy = <T, K>(
	arr: readonly T[],
	keyFn: (item: T) => K,
): T[] => {
	const seen = new Set<K>();
	const out: T[] = [];
	for (const item of arr) {
		const k = keyFn(item);
		if (!seen.has(k)) {
			seen.add(k);
			out.push(item);
		}
	}
	return out;
};

export const groupBy = <T, K extends string>(
	arr: readonly T[],
	keyFn: (item: T) => K,
): Record<K, T[]> => {
	const out = {} as Record<K, T[]>;
	for (const item of arr) {
		const k = keyFn(item);
		if (!out[k]) out[k] = [];
		out[k].push(item);
	}
	return out;
};

export const sortBy = <T>(arr: readonly T[], keyFn: (item: T) => number): T[] =>
	[...arr].sort((a, b) => keyFn(a) - keyFn(b));

export const sortByString = <T>(
	arr: readonly T[],
	keyFn: (item: T) => string,
): T[] => [...arr].sort((a, b) => keyFn(a).localeCompare(keyFn(b)));

export const partitionBy = <T>(
	arr: readonly T[],
	pred: (item: T) => boolean,
): { yes: T[]; no: T[] } => {
	const yes: T[] = [];
	const no: T[] = [];
	for (const item of arr) {
		if (pred(item)) yes.push(item);
		else no.push(item);
	}
	return { yes, no };
};

export const filterMap = <T, U>(
	arr: readonly T[],
	fn: (item: T) => U | undefined,
): U[] => {
	const out: U[] = [];
	for (const item of arr) {
		const v = fn(item);
		if (v !== undefined) out.push(v);
	}
	return out;
};

export const chunk = <T>(arr: readonly T[], size: number): T[][] => {
	if (size <= 0) throw new Error("chunk: size must be > 0");
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
};

export const flatten = <T>(arr: readonly (readonly T[])[]): T[] => arr.flat();

export const zip = <A, B>(a: readonly A[], b: readonly B[]): Array<[A, B]> => {
	const len = Math.min(a.length, b.length);
	const out: Array<[A, B]> = [];
	for (let i = 0; i < len; i++) {
		const av = a[i];
		const bv = b[i];
		if (av !== undefined && bv !== undefined) out.push([av, bv]);
	}
	return out;
};
