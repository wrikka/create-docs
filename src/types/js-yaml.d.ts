declare module "js-yaml" {
	export interface LoadOptions {
		filename?: string;
		json?: boolean;
		onWarning?: (error: unknown) => void;
		schema?: Schema;
	}

	export interface DumpOptions {
		indent?: number;
		lineWidth?: number;
		noRefs?: boolean;
		schema?: Schema;
	}

	export interface Schema {}

	export const DEFAULT_SCHEMA: Schema;
	export const JSON_SCHEMA: Schema;
	export const YAMLException: new (
		message?: string,
		mark?: { line: number; column: number },
	) => Error & { mark?: { line: number; column: number } };

	export function load(input: string, options?: LoadOptions): unknown;
	export function loadAll(input: string, options?: LoadOptions): unknown[];
	export function dump(input: unknown, options?: DumpOptions): string;
	export function safeLoad(input: string, options?: LoadOptions): unknown;
	export function safeLoadAll(input: string, options?: LoadOptions): unknown[];
	export function safeDump(input: unknown, options?: DumpOptions): string;

	const yaml: {
		load: typeof load;
		dump: typeof dump;
		safeLoad: typeof safeLoad;
		safeDump: typeof safeDump;
		DEFAULT_SCHEMA: Schema;
		JSON_SCHEMA: Schema;
		YAMLException: typeof YAMLException;
	};
	export default yaml;
}
