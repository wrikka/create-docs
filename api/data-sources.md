---
title: Data Sources
description: Built-in DocsDataSource adapters and the query API.
order: 4
category: API Reference
tags: [api]
---

# Data Sources

## `createStaticDataSource`

Filesystem / `import.meta.glob` data source. Supports frontmatter, `_dir.yml`, draft/scheduled docs, MiniSearch, and `query()`.

```ts
const dataSource = createStaticDataSource({
  collections: [
    {
      meta: { id: "docs", label: "Docs" },
      files,
      schema: docSchema, // optional ArkType
    },
  ],
  drafts: true,
});
```

## `createRemoteDataSource`

Fetch a remote manifest and documents.

```ts
const dataSource = createRemoteDataSource({
  collection: "docs",
  baseUrl: "https://api.example.com/docs",
});
```

## `createCompositeDataSource`

Combine multiple data sources into one.

```ts
const dataSource = createCompositeDataSource([
  staticSource,
  remoteSource,
]);
```

## `queryDocs`

Pure filter/sort helper used by all sources.

```ts
queryDocs(entries, {
  where: { category: "Guide", tag: "api" },
  sort: "order",
  order: "asc",
  limit: 10,
});
```

## `parseFrontmatter`

Parse YAML frontmatter from raw markdown.

```ts
const { data, content } = parseFrontmatter(raw);
```
