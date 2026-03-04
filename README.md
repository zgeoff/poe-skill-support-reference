# PoE Skill Support Reference

A quick-reference tool for [Path of Exile](https://www.pathofexile.com/) skill gem support compatibility. Look up any skill gem and see which support gems it's compatible with, useful for determining potential imbuement outcomes with djinn coins in 3.28.

**[Live site](https://zgeoff.github.io/poe-skill-support-reference/)**

## Features

- Browse all skill gems by color (red / green / blue)
- Fuzzy search by skill name
- Pin frequently used skills for quick access
- Sort by name or number of supports
- Shareable URLs — filters, search, and expanded rows are synced to the URL hash

## Getting Started

Requires [Bun](https://bun.sh/).

```sh
bun install
bun run dev
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server |
| `bun run build` | Production build → `docs/` |
| `bun run test` | Run tests |
| `bun run lint` | Lint (Biome) |
| `bun run typecheck` | TypeScript check |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Fuse.js · Vitest
