---
title: Showcase
description: Real UI components and layouts in action.
order: 200
category: Showcase
tags: [showcase]
layout: page
---

# Showcase

This page demonstrates the components available in create-docs.

## Cards

<card-grid>

<card title="Fast" icon="i-mdi:lightning-bolt" to="/docs/getting-started">
  Vite + SolidJS + UnoCSS for instant dev and small bundles.
</card>

<card title="Pluggable" icon="i-mdi:puzzle" to="/docs/data-sources">
  Swap in any data source: filesystem, remote, CMS, or custom.
</card>

<card title="Search" icon="i-mdi:magnify" to="/docs/features">
  Full-text search out of the box with keyboard shortcuts.
</card>

<card title="Themable" icon="i-mdi:palette" to="/docs/theming">
  Design tokens + UnoCSS shortcuts + dark mode.
</card>

</card-grid>

## Tabs

<tabs>

<tab label="Preview">

<card title="Preview" icon="i-mdi:eye">
  This tab shows a live preview of a component.
</card>

</tab>

<tab label="Code">

```tsx
<tabs>
  <tab label="Preview">...</tab>
  <tab label="Code">```tsx ... ```</tab>
</tabs>
```

</tab>

</tabs>

## Timeline

<timeline>

<event date="2024-06" title="Project start">
  Initial create-docs runtime.
</event>

<event date="2025-01" title="Solid runtime">
  Rewrote the runtime on SolidJS with VitePress-like UX.
</event>

<event date="2025-03" title="Ship">
  Public release and Cloudflare deployment.
</event>

</timeline>

## Badges and keys

<kbd>Ctrl</kbd> + <kbd>K</kbd> opens search. <badge text="stable" type="success" /> <badge text="beta" type="warning" /> <badge text="deprecated" type="danger" />

## File tree

<file-tree>

<folder name="my-docs">
  <folder name="docs">
    <file name="index.md" />
    <file name="getting-started.md" />
    <file name="_dir.yml" />
  </folder>
  <file name="package.json" />
  <file name="vite.config.ts" />
</folder>

</file-tree>

## Accordion

<accordion>

<item title="How do I add a custom data source?">
  Implement `DocsDataSource` or wrap existing sources with `createCompositeDataSource`.
</item>

<item title="Can I use MDX?">
  The runtime supports JSX-style components in `.md` frontmatter via `comark` custom component handlers.
</item>

</accordion>

## YouTube

<youtube id="dQw4w9WgXcQ" />
