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

1. `bunx create-docs-translate --docs <dir> --locales th,ja` scans your docs
   and writes `translation-plan.json` with one task per
   `(document, locale)` pair.
2. Pass `--apply` to run the pending tasks through an OpenAI-compatible
   chat-completions endpoint, and `--limit N` to cap each run (cost control).
3. When docs are generated (e.g. pulled from GitHub and gitignored), pass
   `--i18n <dir>` so translations are written to a tracked folder
   (`<i18n>/<locale>/<file>`) that survives re-pulls — wire that folder into
   your `createStaticDataSource` glob next to the pulled content.
4. A CI workflow (e.g. `.github/workflows/translate.yml`) runs the script,
   then commits the translated markdown back to the repo.

```bash
# plan only
bunx create-docs-translate --docs docs --locales th --out plan.json

# translate up to 20 files for one collection
TRANSLATE_PROVIDER=openai TRANSLATE_API_KEY=sk-… \
bunx create-docs-translate \
  --docs docs/docs/bun-packages \
  --i18n i18n/bun-packages \
  --locales th --apply --limit 20
```

| Env var | Default | Purpose |
| ------- | ------- | ------- |
| `TRANSLATE_PROVIDER` | — | Enables `--apply` (e.g. `openai`) |
| `TRANSLATE_API_KEY` | `OPENAI_API_KEY` | Provider API key |
| `TRANSLATE_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible endpoint |
| `TRANSLATE_MODEL` | `gpt-4o-mini` | Chat model |
| `TRANSLATE_CONCURRENCY` | `3` | Parallel requests |
| `SOURCE_LOCALE` | `en` | Source language |

The `/translate` page derives per-doc status from doc ids and tags: a doc
counts as translated for a locale when its id contains `.{locale}` or
`--{locale}` (e.g. `th--index`), or when it carries a `lang:{locale}` /
`locale:{locale}` tag.
