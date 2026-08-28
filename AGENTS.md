---
name: @wrikka/create-docs
description: Vite plugin for documentation sites built on Functional Clean Architecture with SolidJS support
related:
  - follow-create-devin-skills
  - follow-skills-map
  - improve-codebase
  - optimize-codebase
  - ask-me
---

## Goal

Agent guidance for the `@wrikka/create-docs` workspace.

## Scope

This workspace lives in `apps/web/create-docs` within the monorepo.

## Execute

Run the following scripts from `apps/web/create-docs`:

| Script | Command |
|---|---|
| `dev` | `bun run src/index.ts` |
| `build` | `bunup` |
| `build:watch` | `bunup --watch` |
| `typecheck` | `tsgo --noEmit` |
| `typecheck:watch` | `tsgo --noEmit --watch` |
| `lint` | `biome check` |
| `lint:fix` | `biome check --write` |
| `format` | `biome check --write` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |
| `scan` | `ast-grep scan` |
| `check` | `bun run lint && bun run typecheck && bun run scan` |
| `verify` | `bun run check && bun run test && bun run build` |
| `deps:analyze` | `bunx depcheck` |
| `clean` | `bunx rimraf dist node_modules` |
| `security` | `bunx audit` |

Moon tasks: `build, build-watch, check, clean, deps-analyze, dev, format, lint, lint-fix, scan, security, test, test-coverage, test-watch, typecheck, typecheck-watch, verify`

### Architecture

| Tech | Skill |
|---|---|
| react | `tech: /follow-react` |
| arktype | `tech: /follow-arktype` |
| solidjs | `tech: /follow-solidjs` |
| biome | `tech: /follow-biome` |
| typescript | `tech: /follow-typescript` |
| bunup | `tech: /follow-bunup` |
| vite | `tech: /follow-vite` |
| vitest | `tech: /follow-vitest` |

### Skills

- follow-create-devin-skills
- follow-skills-map
- improve-codebase
- optimize-codebase
- ask-me

### Workspaces

- uses: `@wrikka/utils` (`packages/default-config`)

## Rules

- Keep under 250 lines.
- Map tech stack with `tech: /follow-<skill>`.
- Map workspace dependencies in `uses:`.
- Do not duplicate root conventions.

## Expected Outcome

- `@wrikka/create-docs` AGENTS.md is accurate and committed.
