---
title: Configuration
description: Site, features, i18n, versioning, and navigation config.
order: 4
category: Reference
tags: [config]
---

# Configuration

`mountDocsApp` accepts a `DocsAppConfig` object.

## Site

```ts
import { mountDocsApp } from "@wrikka/create-docs/solid";

mountDocsApp({
  site: {
    title: "My Docs",
    description: "Docs for my project",
    url: "https://docs.example.com",
    ogImage: "https://docs.example.com/og.png",
  },
});
```

## Features

Toggle parts of the UI per page or globally.

```ts
mountDocsApp({
  features: {
    search: true,
    toc: true,
    aside: true,
    breadcrumbs: true,
    lastUpdated: true,
    editLink: true,
    themeToggle: true,
    pwa: true,
    analytics: false,
  },
});
```

## i18n

```ts
i18n: {
  current: "en",
  default: "en",
  list: [
    { id: "en", label: "English" },
    { id: "th", label: "ไทย" },
  ],
}
```

## Navigation

Collections come from the data source. Their order, labels, and icons are set in `CollectionMeta`. Pages are sorted by `order` frontmatter and then by title.

## Versions

```ts
versions: {
  current: "v2",
  list: [
    { id: "v1", label: "v1.x", url: "https://v1.docs.example.com" },
    { id: "v2", label: "v2.x" },
  ],
}
```
