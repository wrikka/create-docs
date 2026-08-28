/**
 * Versioning types for multi-version documentation support.
 */

export type Version = string;

export type VersionConfig = {
	readonly defaultVersion: Version;
	readonly versions: readonly Version[];
	readonly versionPaths: Readonly<Record<Version, string>>;
};

export type VersionedDocPage = {
	readonly version: Version;
	readonly slug: string;
	readonly originalSlug: string;
};
