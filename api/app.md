---
title: App
description: createDocsApp and mountDocsApp.
order: 2
category: API Reference
tags: [api]
---

# App

## `mountDocsApp`

Mount the full documentation app into a DOM element.

```tsx
import { mountDocsApp } from "@wrikka/create-docs/solid";
import { dataSource } from "./data-source";

mountDocsApp({
  el: document.getElementById("root")!,
  site: { title: "My Docs" },
  dataSource,
});
```

## `createDocsApp`

Returns a configured `DocsApp` without mounting. Useful for testing or custom renderers.

```tsx
import { createDocsApp } from "@wrikka/create-docs/solid";

const app = createDocsApp({
  site: { title: "My Docs" },
  dataSource,
});
```
