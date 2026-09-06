---
title: API Reference
description: Complete public API for create-docs runtime and plugin.
order: 1
category: API Reference
tags: [api]
---

# API Reference

create-docs exports two main entry points:

- `@wrikka/create-docs` — the Vite plugin and build-time utilities
- `@wrikka/create-docs/solid` — the SolidJS runtime app shell

For consuming the docs site in your own Solid app, the runtime is what you need.

## Runtime entry

```ts
import { mountDocsApp } from "@wrikka/create-docs/solid";
```

The runtime is organized into:

| Section | Description |
|---|---|
| [Application](./app) | `createDocsApp`, `mountDocsApp` |
| [Components](./components) | Solid components you can compose |
| [Data sources](./data-sources) | `createStaticDataSource`, `createRemoteDataSource`, `createCompositeDataSource` |
| [GitHub helpers](./github) | Fetch releases, contributors, commits, milestones, repo stats |
| [SEO helpers](./seo) | Sitemap, robots, RSS, Atom, JSON feed, llms.txt |
| [Theme](./theme) | `initTheme`, `useTheme` |
