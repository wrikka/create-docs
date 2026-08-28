/**
 * Public API for the external-search module.
 */

export { createAlgoliaAdapter } from "./application/algolia-adapter";
export { createMeilisearchAdapter } from "./application/meilisearch-adapter";
export * from "./domain/operations/search-operations";
export * from "./ports/external-search-port";
export * from "./types/search";
