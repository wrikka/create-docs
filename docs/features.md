---
title: Features
description: Search, SEO, API references, analytics, PWA, and more.
order: 5
category: Guide
tags: [features]
---

# Features

## Search

`SearchPalette` indexes the data source with MiniSearch. Press `Ctrl+K` or `/` to open it.

## SEO

Every page gets:

- `<title>` and `<meta>` tags
- `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
- `twitter:card`
- `canonical`, `hreflang` alternates
- JSON-LD `WebSite`, `BreadcrumbList`, `TechArticle`
- RSS, Atom, and JSON feed `<link>` tags

Framework helpers:

```ts
import { generateSitemap, generateRobots, generateAtom, generateJsonFeed, generateLlmsTxt } from "@wrikka/create-docs/solid";
```

## API references

A collection with `type: "api"` renders an API reference layout. Provide `endpoints` and the runtime builds a playground for each route.

## GitHub integration

Set `site.repoUrl` to enable:

- Edit / source / report issue / open PR actions
- GitHub releases / changelog
- Repository stats
- Contributors and milestones

## Analytics

Enable `features.analytics` to track page views locally and visit `/analytics` for a dashboard.

## PWA

Enable `features.pwa` and a `manifest.webmanifest` is generated; `setupPwa()` registers a service worker.
