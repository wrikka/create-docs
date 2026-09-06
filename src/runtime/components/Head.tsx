import { useParams } from "@tanstack/solid-router";
import { createEffect } from "solid-js";
import { useDocs } from "../context";
import { createDocsList, useCollections } from "../data";

const HEAD_MARKER = "data-docs-head";

function cleanupHead() {
	for (const el of Array.from(document.querySelectorAll(`[${HEAD_MARKER}]`))) {
		el.remove();
	}
}

function setMeta(name: string, content: string, property = false) {
	const el = document.createElement("meta");
	el.setAttribute(HEAD_MARKER, "meta");
	if (property) {
		el.setAttribute("property", name);
	} else {
		el.setAttribute("name", name);
	}
	el.content = content;
	document.head.appendChild(el);
}

function setLink(rel: string, href: string, attrs?: Record<string, string>) {
	if (!href) return;
	const el = document.createElement("link");
	el.setAttribute(HEAD_MARKER, "link");
	el.setAttribute("rel", rel);
	el.href = href;
	for (const [k, v] of Object.entries(attrs ?? {})) {
		el.setAttribute(k, v);
	}
	document.head.appendChild(el);
}

function setJsonLd(payload: unknown) {
	const id = "docs-json-ld";
	let script = document.getElementById(id) as HTMLScriptElement | null;
	if (!script) {
		script = document.createElement("script");
		script.id = id;
		script.type = "application/ld+json";
		document.head.appendChild(script);
	}
	script.textContent = JSON.stringify(payload);
}

export function Head() {
	const config = useDocs();
	const params = useParams({ strict: false });
	const collections = useCollections();
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const [docs] = createDocsList(collection);

	createEffect(() => {
		cleanupHead();

		const site = config.site;
		const siteUrl = (site.url ?? "").replace(/\/$/, "");
		const colMeta = collections()?.find((c) => c.id === collection());
		const docMeta = (docs() ?? []).find((d) => d.id === docId());
		const docSeo = docMeta?.seo;

		const parts: string[] = [];
		if (docMeta) parts.push(docSeo?.title ?? docMeta.label);
		if (colMeta) parts.push(colMeta.label);
		parts.push(site.title);
		const title = parts.join(" — ");

		const description =
			docSeo?.description ||
			docMeta?.description ||
			colMeta?.description ||
			site.description ||
			"";

		const path = collection()
			? docId()
				? `${collection()}/${docId()}`
				: collection()
			: "";
		const canonical = siteUrl ? `${siteUrl}/${path}`.replace(/\/$/, "") : "";
		const ogImage = docSeo?.image || site.ogImage || `${siteUrl}/og-image.png`;

		const ogType: "article" | "website" =
			docSeo?.ogType ?? (docMeta ? "article" : "website");

		document.title = title;
		if (config.i18n?.current) {
			document.documentElement.lang = config.i18n.current;
		}

		if (docSeo?.noIndex) {
			setMeta("robots", "noindex, nofollow");
		}

		setMeta("description", description);
		setMeta("og:title", title, true);
		setMeta("og:description", description, true);
		setMeta("og:url", canonical, true);
		setMeta("og:image", ogImage, true);
		setMeta("og:type", ogType, true);
		if (docMeta?.publishedAt) {
			setMeta("article:published_time", docMeta.publishedAt, true);
		}
		if (docMeta?.lastUpdated) {
			setMeta("article:modified_time", docMeta.lastUpdated, true);
		}
		if (config.i18n?.current) {
			setMeta("og:locale", config.i18n.current.replace("-", "_"), true);
		}

		setMeta("twitter:card", "summary_large_image");
		setMeta("twitter:title", title);
		setMeta("twitter:description", description);
		if (ogImage) setMeta("twitter:image", ogImage);
		setLink("canonical", canonical);

		if (config.i18n?.list && siteUrl) {
			for (const locale of config.i18n.list) {
				const href = locale.url
					? `${locale.url.replace(/\/$/, "")}/${path}`.replace(/\/$/, "")
					: `${siteUrl}/${locale.id}/${path}`.replace(/\/$/, "");
				setLink("alternate", href, { hreflang: locale.id });
			}
			setLink("alternate", canonical, { hreflang: "x-default" });
		}

		if (config.features?.rss !== false) {
			setLink("alternate", `${siteUrl}/rss.xml`, {
				type: "application/rss+xml",
				title: `${site.title} RSS`,
			});
		}
		setLink("alternate", `${siteUrl}/feed.atom`, {
			type: "application/atom+xml",
			title: `${site.title} Atom Feed`,
		});
		setLink("alternate", `${siteUrl}/feed.json`, {
			type: "application/feed+json",
			title: `${site.title} JSON Feed`,
		});
		setLink("alternate", `${siteUrl}/llm.txt`, {
			type: "text/plain",
			title: `${site.title} LLMs.txt`,
		});
		setLink("alternate", `${siteUrl}/llms-plugins.txt`, {
			type: "text/plain",
			title: `${site.title} Plugins LLMs.txt`,
		});

		const schemas: unknown[] = [];
		schemas.push({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: site.title,
			description: site.description || "",
			url: siteUrl || "/",
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${siteUrl || ""}/?q={search_term_string}`,
				},
				"query-input": "required name=search_term_string",
			},
		});

		if (docMeta && siteUrl) {
			const breadcrumb = {
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: site.title,
						item: siteUrl,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: colMeta?.label ?? collection(),
						item: `${siteUrl}/${collection()}`,
					},
					{
						"@type": "ListItem",
						position: 3,
						name: docMeta.label,
						item: `${siteUrl}/${collection()}/${docMeta.id}`,
					},
				],
			};
			schemas.push(breadcrumb);

			const article: Record<string, unknown> = {
				"@context": "https://schema.org",
				"@type": "TechArticle",
				headline: docMeta.label,
				description: docMeta.description,
				url: `${siteUrl}/${collection()}/${docMeta.id}`,
				author: {
					"@type": "Organization",
					name: site.title,
				},
				publisher: {
					"@type": "Organization",
					name: site.title,
					logo: ogImage,
				},
			};
			if (docMeta.publishedAt) article.datePublished = docMeta.publishedAt;
			if (docMeta.lastUpdated) article.dateModified = docMeta.lastUpdated;
			if (ogImage) article.image = ogImage;
			schemas.push(article);
		}

		setJsonLd(schemas);
	});

	return null;
}
