---
title: SEO Helpers
description: Generators for sitemap, robots, feeds, and JSON-LD.
order: 6
category: API Reference
tags: [api]
---

# SEO Helpers

All generators accept a `SeoInput` with `site`, `collections`, and `docs`.

- `generateSitemap(input)` — XML sitemap
- `generateRobots(siteUrl)` — robots.txt
- `generateRss(input)` — RSS 2.0
- `generateAtom(input)` — Atom feed
- `generateJsonFeed(input)` — JSON Feed 1.1
- `generateLlmsTxt(input)` — `llms.txt` Markdown summary

The `Head` component already sets:

- `<title>`, `<meta>`
- Open Graph and Twitter cards
- `canonical`, `hreflang` alternates
- Atom + JSON feed `<link>`
- JSON-LD `WebSite`, `BreadcrumbList`, `TechArticle`
