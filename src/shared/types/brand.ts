/**
 * Brand<T, B> — A nominal type for primitives (preventing ID mixups at compile time).
 *
 * @example
 *   type UserId = Brand<string, 'UserId'>;
 *   type PostId = Brand<string, 'PostId'>;
 *   const get = (id: UserId) => ...;
 *   get('abc' as UserId); // OK
 *   get('abc' as PostId); // compile error
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export const brand = <T, B extends string>(value: T): Brand<T, B> =>
	value as Brand<T, B>;
