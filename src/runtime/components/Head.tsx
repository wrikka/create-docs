import { useParams } from "@tanstack/solid-router";
import { createEffect } from "solid-js";
import { useDocs } from "../context";
import { createDocsList, useCollections } from "../data";

function setMeta(name: string, content: string, property = false) {
	const selector = property
		? `meta[property="${name}"]`
		: `meta[name="${name}"]`;
	let el = document.querySelector<HTMLMetaElement>(selector);
	if (!el) {
		el = document.createElement("meta");
		if (property) {
			el.setAttribute("property", name);
		} else {
			el.setAttribute("name", name);
		}
		document.head.appendChild(el);
	}
	el.content = content;
}

function setLink(rel: string, href: string) {
	if (!href) return;
	const selector = `link[rel="${rel}"]`;
	let el = document.querySelector<HTMLLinkElement>(selector);
	if (!el) {
		el = document.createElement("link");
		el.setAttribute("rel", rel);
		document.head.appendChild(el);
	}
	el.href = href;
}

export function Head() {
	const config = useDocs();
	const params = useParams({ strict: false });
	const collections = useCollections();
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const [docs] = createDocsList(collection);

	createEffect(() => {
		const site = config.site;
		const siteUrl = (site.url ?? "").replace(/\/$/, "");
		const colMeta = collections()?.find((c) => c.id === collection());
		const docMeta = (docs() ?? []).find((d) => d.id === docId());

		const parts: string[] = [];
		if (docMeta) parts.push(docMeta.label);
		if (colMeta) parts.push(colMeta.label);
		parts.push(site.title);
		const title = parts.join(" — ");

		const description =
			docMeta?.description || colMeta?.description || site.description || "";

		const path = collection()
			? docId()
				? `${collection()}/${docId()}`
				: collection()
			: "";
		const canonical = siteUrl ? `${siteUrl}/${path}`.replace(/\/$/, "") : "";
		const ogImage = site.ogImage || `${siteUrl}/og-image.png`;

		document.title = title;
		setMeta("description", description);
		setMeta("og:title", title, true);
		setMeta("og:description", description, true);
		setMeta("og:url", canonical, true);
		setMeta("og:image", ogImage, true);
		setMeta("twitter:card", "summary_large_image");
		setMeta("twitter:title", title);
		setMeta("twitter:description", description);
		if (ogImage) setMeta("twitter:image", ogImage);
		setLink("canonical", canonical);
	});

	return null;
}
