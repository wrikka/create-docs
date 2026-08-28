/**
 * MDX types for MDX support.
 */

export type MdxComponent = {
	readonly name: string;
	readonly source: string;
};

export type MdxOptions = {
	readonly components?: Readonly<Record<string, MdxComponent>>;
	readonly remarkPlugins?: readonly unknown[];
	readonly rehypePlugins?: readonly unknown[];
};
