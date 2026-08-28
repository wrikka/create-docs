/**
 * Vite plugin presentation entry point.
 * This is the ONLY file in `presentation/` that should be imported by the
 * public API — it's the imperative shell that wires adapters to use cases.
 */

export type { DocsPluginConfig } from "./docs-plugin";
export { default, docsPlugin } from "./docs-plugin";
export { transformMarkdown } from "./transform-markdown";
