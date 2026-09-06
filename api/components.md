---
title: Components
description: SolidJS components exported by the runtime.
order: 3
category: API Reference
tags: [api]
---

# Components

All components are SolidJS JSX and can be imported directly.

## Layout components

- `DocsLayout` — root layout with sidebar, header, and main area
- `TopNav` — sticky header with search, theme, locale, version, and links
- `SidebarNav` — collection sidebar
- `Footer` — site footer with links and copyright
- `Banner` — announcement banner

## Document components

- `DocMarkdown` — render markdown with callouts, code groups, and components
- `DocToc` — table of contents with scroll-spy
- `DocPrevNext` — previous / next page links
- `PageActions` — copy, view .md, edit, report, PR, ChatGPT, Claude
- `RelatedDocs` — tag-based related documents
- `Breadcrumbs` — collection / category / page breadcrumbs

## UI components

- `SearchPalette` — command-palette-style full-text search
- `ThemeToggle` — light / dark / system switch
- `LocaleDropdown` — language switcher
- `VersionDropdown` — docs version switcher
- `CollectionDropdown` — collection switcher
- `GitHubStats` — repo stars, forks, watchers
- `ScrollProgress` — reading progress bar
- `BackToTop` — scroll to top button
- `SkeletonBlock`, `SkeletonPage`, `SkeletonText` — loading skeletons

## Page components

- `HomePage` — hero + feature grid
- `DocPage` — standard document page
- `CollectionPage` — collection index
- `ChangelogPage` — GitHub releases
- `CommunityPage` — contributors and milestones
- `PluginsPage` — plugin marketplace
- `AnalyticsPage` — local analytics dashboard
- `ApiDiffPage` — API diff between versions
- `ApiEndpointPage` — single API endpoint playground
