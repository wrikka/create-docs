---
title: Deployment
description: Build, output, and deploy the docs site.
order: 7
category: Reference
tags: [deploy]
---

# Deployment

## Build

The CLI scaffolds a Vite + SolidJS app. Build it with:

```bash
bun run build
```

The default output is in `dist/`.

## Static hosting

`create-docs` is a client-side SPA. Deploy `dist/` to any static host:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Configure a catch-all redirect to `index.html` so deep links work.

## Environment variables

Set `DOCS_BASE_URL` to bake the public URL into `site.url` at build time if your app reads it.

## SEO artifacts

Use the exported generators to produce `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/feed.atom`, `/feed.json`, and `/llms.txt`.
