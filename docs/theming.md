---
title: Theming
description: Customize colors, fonts, and UnoCSS shortcuts.
order: 8
category: Guide
tags: [theme]
---

# Theming

## CSS variables

`theme.css` exposes design tokens. Override them in your own CSS:

```css
:root {
  --rt-bg: #ffffff;
  --rt-fg: #1a1a1a;
  --rt-border: #e3e3e3;
  --rt-accent: #2ea043;
  --rt-accent-2: #1f6feb;
}

html.dark {
  --rt-bg: #0d1117;
  --rt-fg: #c9d1d9;
  --rt-border: #30363d;
  --rt-accent: #3fb950;
  --rt-accent-2: #58a6ff;
}
```

## UnoCSS

The runtime ships utility-first classes. Extend shortcuts in your `uno.config.ts`:

```ts
import { defineConfig } from "unocss";

export default defineConfig({
  shortcuts: {
    "docs-card": "rounded border border-border p-4 bg-surface",
  },
});
```

## Dark mode

Call `initTheme("dark")` or `"system"` before mounting. The theme toggle uses `data-theme` and `html.dark`.

## Reduced motion

All motion respects `prefers-reduced-motion: reduce`.
