---
title: Introduction
description: What create-docs is and why it exists.
order: 1
category: Guide
tags: [intro]
---

# create-docs

**create-docs** is a documentation runtime for SolidJS — think VitePress-style
docs with Scalar-like API references, driven entirely by a pluggable data
source.

## What you get

- Markdown docs with callouts, code groups, steps, Mermaid, and math
- Full-text search, breadcrumbs, edit links, last-updated
- GitHub integration: releases changelog, stats, contributors, milestones
- API reference collections with an interactive playground
- PWA, analytics, i18n, and versioning switches

## Quick start

```bash
bun create @wrikka/docs my-docs
cd my-docs
bun install
bun run dev
```

> [!TIP]
> Every markdown file under `docs/` becomes a page — frontmatter controls
> title, order, badges, drafts, and more.
