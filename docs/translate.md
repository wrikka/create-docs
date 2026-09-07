---
title: AI Translation
description: Translate docs with AI from CI — plan, review, and ship locales.
order: 9
category: Features
tags: [translate, i18n, ai]
---

create-docs ships a translation pipeline that runs in CI, not in the browser.
The runtime shows the UX — locale cards, per-doc status, and copyable
commands — while the actual translation is produced by an AI provider in a
workflow.

## Enable

```ts
mountDocsApp({
  features: { translate: true },
  translate: {
    provider: "ai",          // provider hint shown in the UI
    workflow: "translate.yml",
    locales: [
      { id: "th", label: "ไทย" },
      { id: "ja", label: "日本語" },
    ],
  },
});
```

This adds a **Translate** item to the top nav and sidebar, a `/translate`
page, and a per-page Translate action on doc pages.

## How it works

1. `bunx create-docs-translate --docs docs --locales th,ja` scans your docs
   and writes `translation-plan.json` with one task per
   `(document, locale)` pair.
2. A CI workflow (e.g. `.github/workflows/translate.yml`) runs the planner
   and — once a `TRANSLATE_PROVIDER` and API key are configured — feeds the
   plan to the provider.
3. Translated markdown lands under `docs/<locale>/…`, gets committed, and the
   locale switcher picks it up automatically.

The `/translate` page derives per-doc status from doc ids and tags: a doc
counts as translated for a locale when its id contains `.{locale}` or
`--{locale}`, or when it carries a `lang:{locale}` / `locale:{locale}` tag.
