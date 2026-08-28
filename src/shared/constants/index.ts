/**
 * Compile-time static constants. These are the only safe values
 * to import in the domain layer (where I/O is forbidden).
 */

export const DEFAULT_DOCS_DIR = "docs" as const;
export const DEFAULT_BASE_ROUTE = "/docs" as const;
export const DEFAULT_PORT = 5173 as const;
export const VIRTUAL_PREFIX = "virtual:docs/" as const;
export const PLUGIN_NAME = "vite-plugin-docs" as const;

export const SUPPORTED_EXTENSIONS = [".md", ".mdoc"] as const;
export const FRONTMATTER_DELIMITER = "---" as const;

export const SEARCH_CONTENT_LIMIT = 500 as const;
export const SIDEBAR_DEFAULT_GROUP_TITLE = "Documentation" as const;
export const SIDEBAR_DEFAULT_ORDER = 999 as const;

export const BADGE_VARIANTS = [
	"default",
	"success",
	"warning",
	"danger",
] as const;
export const API_AUTH_TYPES = ["bearer", "apiKey", "oauth2"] as const;
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
