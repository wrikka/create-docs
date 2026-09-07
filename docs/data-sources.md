---
title: Data Sources
description: Filesystem, remote, composite, and custom data sources.
order: 6
category: Reference
tags: [data]
---

# Data Sources

## Static / filesystem

```ts
import { createStaticDataSource } from "@wrikka/create-docs/solid";

const files = import.meta.glob("./docs/**/*.{md,yml,yaml}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const dataSource = createStaticDataSource({
  collections: [
    {
      meta: { id: "docs", label: "Docs" },
      files,
    },
  ],
  drafts: true,
});
```

Supports frontmatter, `_dir.yml` navigation, drafts, scheduled publishing, and MiniSearch.

### ArkType schema per collection

```ts
import { type } from "arktype";

const docSchema = type({
  title: "string",
  "description?": "string",
  "order?": "number",
  "tags?": "string[]",
});

const dataSource = createStaticDataSource({
  collections: [{ meta: { id: "docs", label: "Docs" }, files, schema: docSchema }],
});
```

## Remote

```ts
import { createRemoteDataSource } from "@wrikka/create-docs/solid";

const dataSource = createRemoteDataSource({
  collection: "docs",
  baseUrl: "https://api.example.com/docs",
});
```

## Composite

Combine multiple data sources:

```ts
import { createCompositeDataSource } from "@wrikka/create-docs/solid";

const dataSource = createCompositeDataSource([
  staticSource,
  createRemoteDataSource({ collection: "api", baseUrl: "https://api.example.com" }),
]);
```

## Custom

Implement `DocsDataSource`:

```ts
interface DocsDataSource {
  collections(): Promise<CollectionMeta[]>;
  list(collection: string): Promise<DocEntry[]>;
  get(collection: string, id: string): Promise<DocContent>;
  search(q: string, collection?: string): Promise<SearchResult[]>;
  query?(q: DocQuery): Promise<DocEntry[]>;
}
```
