/**
 * SEO Optimization Types
 *
 * Domain types for SEO optimization
 */

/**
 * Meta tags
 */
export interface MetaTags {
	/** Title */
	title?: string;
	/** Description */
	description?: string;
	/** Keywords */
	keywords?: string[];
	/** Author */
	author?: string;
	/** Open Graph title */
	ogTitle?: string;
	/** Open Graph description */
	ogDescription?: string;
	/** Open Graph image */
	ogImage?: string;
	/** Twitter card */
	twitterCard?: "summary" | "summary_large_image";
}

/**
 * SEO options
 */
export interface SeoOptions {
	/** Generate meta tags */
	generateMeta?: boolean;
	/** Generate Open Graph tags */
	generateOg?: boolean;
	/** Generate Twitter card tags */
	generateTwitter?: boolean;
	/** Generate canonical URL */
	generateCanonical?: boolean;
}
