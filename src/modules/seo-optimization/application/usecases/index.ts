/**
 * SEO Optimization Use Cases
 *
 * Orchestration layer for SEO optimization
 */

import { generateMetaTags } from "../../domain";
import type { MetaTags, SeoOptions } from "../../types";

/**
 * Optimize content for SEO
 */
export const optimizeSeo = (
	content: string,
	options: SeoOptions = {},
): MetaTags => {
	return generateMetaTags(content, options);
};
