---
title: GitHub Helpers
description: Fetch repository data for docs pages.
order: 5
category: API Reference
tags: [api]
---

# GitHub Helpers

Set `site.repoUrl` and enable `github` features to use these.

- `fetchRepoStats()` — stars, forks, watchers, open issues
- `fetchReleases()` — release notes and tags
- `fetchContributors()` — top contributors
- `fetchCommits()` — recent commits
- `fetchMilestones()` — open and closed milestones

```ts
import { fetchReleases } from "@wrikka/create-docs/solid";

const releases = await fetchReleases("owner/repo");
```
