---
name: @wrikka/create-docs
description: Vite plugin for documentation sites built on Functional Clean Architecture with SolidJS support
related:
  - set-secret-github
  - ship-to-production
  - watch-github-actions
  - run-build
  - run-typecheck
  - follow-tool-bunup
  - follow-framework-solidjs
  - follow-service-cloudflare
  - follow-tool-wrangler
  - update-agents-md
---

## Goal

Agent guidance for the standalone `@wrikka/create-docs` package.

## Scope

This is the upstream documentation framework repo at `https://github.com/wrikka/create-docs`.
It is consumed by `wrikka/opensource-wrikka-com` and published to npm as `@wrikka/create-docs`.

## Execute

Run the following scripts from the repo root:

| Script | Command |
|---|---|
| `dev` | `bun run src/index.ts` |
| `build` | `bun run build` |
| `typecheck` | `bun run typecheck` |
| `lint` | `bunx biome check` |
| `lint:fix` | `bunx biome check --write` |
| `format` | `bunx biome check --write` |
| `pull:github` | `bun scripts/github-pull.ts --config <path>` |
| `deploy` | `bunx wrangler deploy` |
| `publish` | `npm publish` |
| `clean` | `bunx rimraf dist node_modules` |

### Architecture

| Tech | Skill |
|---|---|
| solidjs | `/follow-framework-solidjs` |
| typescript | `/follow-lang-typescript` |
| biome | `/follow-tool-biome` |
| bunup | `/follow-tool-bunup` |
| vite | `/follow-tool-vite` |
| wrangler | `/follow-tool-wrangler` |
| cloudflare | `/follow-service-cloudflare` |

### Required GitHub Secrets

- `CLOUDFLARE_API_TOKEN` — deploy Worker
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account
- `NPM_TOKEN` — publish to npm
- `GH_PAT` — trigger consumer rebuild

### Skills

- set-secret-github
- ship-to-production
- watch-github-actions
- run-build
- run-typecheck
- follow-tool-bunup

## Rules

- Keep under 250 lines.
- Map tech stack with `tech: /follow-<skill>`.
- Do not duplicate root conventions.
- Run `bun run typecheck` and `bun run build` before shipping.

## Expected Outcome

- `@wrikka/create-docs` AGENTS.md is accurate and committed.
