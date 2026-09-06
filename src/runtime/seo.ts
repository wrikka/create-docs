import type { CollectionMeta, DocEntry } from "./types";

export interface SeoInput {
	site: { title: string; description?: string; url?: string };
	collections: CollectionMeta[];
	docs: Map<string, DocEntry[]>;
}

function escapeXml(text: string) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export function generateSitemap(input: SeoInput): string {
	const baseUrl = (input.site.url ?? "").replace(/\/$/, "");
	const urls: string[] = [];
	if (baseUrl) {
		urls.push(`${baseUrl}/`);
		for (const collection of input.collections) {
			urls.push(`${baseUrl}/${collection.id}`);
			const docs = input.docs.get(collection.id) ?? [];
			for (const doc of docs) {
				urls.push(`${baseUrl}/${collection.id}/${doc.id}`);
			}
		}
	}
	const entries = urls
		.map(
			(url) => `	<url>
		<loc>${escapeXml(url)}</loc>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export function generateRobots(siteUrl?: string): string {
	const sitemap = siteUrl
		? `\nSitemap: ${siteUrl.replace(/\/$/, "")}/sitemap.xml`
		: "";
	return `User-agent: *\nAllow: /${sitemap}`;
}

export function generateRss(input: SeoInput): string {
	const baseUrl = (input.site.url ?? "").replace(/\/$/, "");
	const items: string[] = [];
	for (const collection of input.collections) {
		const docs = input.docs.get(collection.id) ?? [];
		for (const doc of docs) {
			if (!baseUrl) continue;
			const link = `${baseUrl}/${collection.id}/${doc.id}`;
			items.push(`		<item>
			<title>${escapeXml(doc.label)}</title>
			<link>${escapeXml(link)}</link>
			<description>${escapeXml(doc.description || doc.label)}</description>
			<guid>${escapeXml(link)}</guid>
		</item>`);
		}
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>${escapeXml(input.site.title)}</title>
		<link>${escapeXml(baseUrl || "/")}</link>
		<description>${escapeXml(input.site.description || input.site.title)}</description>
		<language>en</language>
		${items.join("\n")}
	</channel>
</rss>`;
}

export function generateAtom(input: SeoInput): string {
	const baseUrl = (input.site.url ?? "").replace(/\/$/, "");
	const updated = new Date().toISOString();
	const items: string[] = [];
	for (const collection of input.collections) {
		const docs = input.docs.get(collection.id) ?? [];
		for (const doc of docs) {
			if (!baseUrl) continue;
			const link = `${baseUrl}/${collection.id}/${doc.id}`;
			const date = doc.lastUpdated ?? updated;
			items.push(`		<entry>
			<title>${escapeXml(doc.label)}</title>
			<link href="${escapeXml(link)}" />
			<id>${escapeXml(link)}</id>
			<updated>${escapeXml(date)}</updated>
			<summary>${escapeXml(doc.description || doc.label)}</summary>
		</entry>`);
		}
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${escapeXml(input.site.title)}</title>
	<link href="${escapeXml(baseUrl || "/")}" />
	<updated>${escapeXml(updated)}</updated>
	<id>${escapeXml(baseUrl || "/")}</id>
	${items.join("\n")}
</feed>`;
}

export function generateJsonFeed(input: SeoInput): string {
	const baseUrl = (input.site.url ?? "").replace(/\/$/, "");
	const items = [];
	for (const collection of input.collections) {
		const docs = input.docs.get(collection.id) ?? [];
		for (const doc of docs) {
			if (!baseUrl) continue;
			const link = `${baseUrl}/${collection.id}/${doc.id}`;
			items.push({
				id: link,
				title: doc.label,
				content_text: doc.description || doc.label,
				url: link,
				date_published: doc.publishedAt ?? doc.lastUpdated,
			});
		}
	}
	return JSON.stringify(
		{
			version: "https://jsonfeed.org/version/1.1",
			title: input.site.title,
			home_page_url: baseUrl || "/",
			feed_url: `${baseUrl}/feed.json`,
			items,
		},
		null,
		2,
	);
}

export function generateLlmsTxt(input: SeoInput): string {
	const baseUrl = (input.site.url ?? "").replace(/\/$/, "");
	const lines: string[] = [
		`# ${input.site.title}`,
		"",
		input.site.description || "",
		"",
		"## Documentation",
	];
	for (const collection of input.collections) {
		const label = collection.label || collection.id;
		lines.push(`- ${label}`);
		const docs = input.docs.get(collection.id) ?? [];
		for (const doc of docs) {
			const link = baseUrl
				? `${baseUrl}/${collection.id}/${doc.id}`
				: `/${collection.id}/${doc.id}`;
			lines.push(
				`  - [${doc.label}](${link}): ${doc.description || doc.label}`,
			);
		}
	}
	return lines.join("\n");
}
