/**
 * SEO Optimization Ports
 *
 * Module-specific interfaces for SEO optimization
 */

import type { MetaTags, SeoOptions } from "../types";

/**
 * Meta tag generator interface
 */
export interface MetaTagGenerator {
	/** Generate meta tags HTML */
	generateMetaHtml(tags: MetaTags): string;
}

// Re-export types for convenience
export type { MetaTags, SeoOptions };
