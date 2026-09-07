> ![Status](https://img.shields.io/badge/status-in_development-red)

# @wrikka/create-docs

Vite plugin for documentation sites built on Functional Clean Architecture with SolidJS support. Parse markdown and MDX, build navigation, generate search indexes, and render beautiful docs with live editing.

Source: [github.com/wrikka/create-docs](https://github.com/wrikka/create-docs)

![Vite](https://img.shields.io/badge/Vite-8.2-646cff)
![SolidJS](https://img.shields.io/badge/SolidJS-1.9-1c6fbb)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178c6)

```text
┌──────────────────────────────────────────────────────────┐
│  create-docs — Vite Docs Plugin                          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  Markdown  │→ │  Parse     │→ │  Virtual   │          │
│  │  + MDX     │  │  Frontmatter│  │  Modules   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                       ↓                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  SolidJS   │← │  Search    │← │  Sidebar   │          │
│  │  Render    │  │  Index     │  │  + Nav     │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└──────────────────────────────────────────────────────────┘
```

## Get Started

1. Install — `bun add @wrikka/create-docs vite`
   ```bash
   bun add @wrikka/create-docs vite
   ```
2. Add Plugin — configure in `vite.config.ts`
   ```typescript
   import { defineConfig } from 'vite';
   import { docsPlugin } from '@wrikka/create-docs';

   export default defineConfig({
     plugins: [docsPlugin({ site: { title: 'My Docs' } })],
   });
   ```
3. Build — `bunup`
   ```bash
   bun run build
   ```

## Features

| Icon | Feature | Description |
|:---:|---------|-------------|
| ![icon](https://api.iconify.design/mdi:language-markdown.svg?color=%231976d2&width=16) | Markdown And MDX Parsing | Parse frontmatter, code blocks, and MDX components |
| ![icon](https://api.iconify.design/mdi:file-tree.svg?color=%23388e3c&width=16) | Navigation Builder | Auto-generate sidebar and nav from folder structure |
| ![icon](https://api.iconify.design/mdi:magnify.svg?color=%23d32f2f&width=16) | Search Index | Build full-text search index from doc pages |
| ![icon](https://api.iconify.design/mdi:format-list-numbered.svg?color=%23f57c00&width=16) | Table Of Contents | Generate TOC from markdown headings |
| ![icon](https://api.iconify.design/mdi:code-braces.svg?color=%237b1fa2&width=16) | Code Block Enhancements | Syntax highlighting and copy buttons for code blocks |
| ![icon](https://api.iconify.design/mdi:pencil-box.svg?color=%23c2185b&width=16) | Live Editor | Edit docs in-browser with git commit and push |
| ![icon](https://api.iconify.design/mdi:seo.svg?color=%23303f9f&width=16) | SEO Optimization | Generate meta tags and optimize for search engines |
| ![icon](https://api.iconify.design/mdi:eye.svg?color=%230097a7&width=16) | File Watcher | Hot reload on markdown file changes |
| ![icon](https://api.iconify.design/mdi:check-circle.svg?color=%2300796b&width=16) | Content Validation | Validate frontmatter and content structure |
| ![icon](https://api.iconify.design/mdi:cube.svg?color=%23ffa000&width=16) | Virtual Modules | Inject parsed content as virtual Vite modules |

## Usage

### Usage via Vite Plugin

Add the plugin to your Vite config and point it at your docs directory.

```typescript
import { defineConfig } from 'vite';
import { docsPlugin } from '@wrikka/create-docs';

export default defineConfig({
  plugins: [docsPlugin({
    site: { title: 'My Docs', description: 'Project documentation' },
    docsDir: './docs',
    search: { enabled: true },
  })],
});
```

```text
┌──────────────────────────────────────────────────────────┐
│  $ vite dev                                              │
│                                                          │
│  VITE v8.2  ready in 320 ms                              │
│                                                          │
│  ➜  Local:   http://localhost:5173/                      │
│  ➜  Network: use --host to expose                       │
│                                                          │
│  [create-docs] Watching ./docs/**/*.md                   │
│  [create-docs] Indexed 24 pages                          │
│  [create-docs] Search index built (186 entries)          │
└──────────────────────────────────────────────────────────┘
```

| option | description | options | default |
|--------|-------------|---------|---------|
| `site` | Site title and description | `title`, `description` | — |
| `docsDir` | Documentation directory path | string | `./docs` |
| `search` | Search configuration | `enabled` | `enabled: true` |
| `watchMode` | File watcher mode | `native`, `polling` | `native` |
| `fullReload` | Force full browser reload | boolean | `false` |

### Usage via SDK

Import parsing, navigation, and search utilities programmatically.

```typescript
import { buildDocPage, buildSidebar, buildSearchIndex } from '@wrikka/create-docs';

const page = buildDocPage(rawMarkdown);
const sidebar = buildSidebar(pages);
const searchIndex = buildSearchIndex(pages);
```

```text
┌──────────────────────────────────────────────────────────┐
│  > buildDocPage('# Hello\n\nContent here...')            │
│                                                          │
│  {                                                       │
│    slug: 'hello',                                        │
│    title: 'Hello',                                       │
│    body: 'Content here...',                              │
│    toc: [{ level: 1, text: 'Hello', slug: 'hello' }]     │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
```

| api | description | options | default |
|-----|-------------|---------|---------|
| `docsPlugin(config)` | Create Vite plugin | `site`, `docsDir`, `search` | — |
| `buildDocPage(raw)` | Parse markdown to doc page | `raw` string | — |
| `buildSidebar(pages)` | Build sidebar from pages | `pages` array | — |
| `buildSearchIndex(pages)` | Build search index | `pages` array | — |
| `generateToc(page)` | Generate table of contents | `page` object | — |
