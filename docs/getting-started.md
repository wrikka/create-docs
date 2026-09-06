---
title: Getting Started
description: Scaffold a site and mount the runtime.
order: 2
category: Guide
tags: [setup]
---

# Getting Started

## Scaffold

<code-group>

```bash [bun]
bun create @wrikka/docs my-docs
```

```bash [npm]
npm create @wrikka/docs my-docs
```

</code-group>

## Mount the app

```tsx
import { mountDocsApp } from "@wrikka/create-docs/solid";
import "@wrikka/create-docs/theme.css";
import "@wrikka/create-docs/markdown-content.css";

mountDocsApp({
  site: { title: "My Docs" },
  dataSource,
});
```

## The data source contract

The runtime talks to a `DocsDataSource` — a small interface with
`collections()`, `list()`, `get()`, `search()`, and optional `ask()` and
`query()`. Ship content from a filesystem glob, an oRPC backend, or any CMS.
