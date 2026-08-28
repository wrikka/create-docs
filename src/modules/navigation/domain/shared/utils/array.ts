/**
 * Pure array helpers used by navigation domain operations.
 */

export const sortBy = <T, K extends number | string>(
	items: readonly T[],
	keyFn: (item: T) => K,
): T[] => {
	return [...items].sort((a, b) => {
		const ka = keyFn(a);
		const kb = keyFn(b);
		if (typeof ka === "number" && typeof kb === "number") {
			return ka - kb;
		}
		return String(ka).localeCompare(String(kb));
	});
};

export const sortByString = <T>(
	items: readonly T[],
	keyFn: (item: T) => string,
): T[] => {
	return [...items].sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
};

export const groupBy = <T, K extends string | number>(
	items: readonly T[],
	keyFn: (item: T) => K,
): Record<string, T[]> => {
	const result: Record<string, T[]> = {};
	for (const item of items) {
		const key = String(keyFn(item));
		if (!result[key]) {
			result[key] = [];
		}
		result[key].push(item);
	}
	return result;
};
