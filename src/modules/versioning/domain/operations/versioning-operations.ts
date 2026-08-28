/**
 * Pure versioning operations.
 * No I/O. No exceptions thrown.
 */

import type {
	Version,
	VersionConfig,
	VersionedDocPage,
} from "../../types/versioning";

/**
 * Extract version from a slug path.
 * Example: "v1/getting-started/introduction" -> "v1"
 */
export const extractVersionFromSlug = (
	slug: string,
	versions: readonly Version[],
): Version | null => {
	const parts = slug.split("/");
	const firstPart = parts[0];
	if (firstPart && versions.includes(firstPart)) {
		return firstPart;
	}
	return null;
};

/**
 * Remove version prefix from a slug.
 * Example: "v1/getting-started/introduction" -> "getting-started/introduction"
 */
export const removeVersionFromSlug = (
	slug: string,
	version: Version,
): string => {
	return slug.startsWith(`${version}/`) ? slug.slice(version.length + 1) : slug;
};

/**
 * Add version prefix to a slug.
 * Example: "getting-started/introduction" + "v1" -> "v1/getting-started/introduction"
 */
export const addVersionToSlug = (slug: string, version: Version): string => {
	return `${version}/${slug}`;
};

/**
 * Group doc pages by version.
 */
export const groupDocsByVersion = (
	pages: readonly VersionedDocPage[],
): Readonly<Record<Version, readonly VersionedDocPage[]>> => {
	const groups: Record<string, VersionedDocPage[]> = {};
	for (const page of pages) {
		const { version } = page;
		if (!groups[version]) {
			groups[version] = [];
		}
		groups[version].push(page);
	}
	return groups;
};

/**
 * Validate version config.
 */
export const validateVersionConfig = (config: VersionConfig): boolean => {
	if (
		!config.defaultVersion ||
		!config.versions.includes(config.defaultVersion)
	) {
		return false;
	}
	for (const version of config.versions) {
		if (!config.versionPaths[version]) {
			return false;
		}
	}
	return true;
};
