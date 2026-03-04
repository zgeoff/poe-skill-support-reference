# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Path of Exile reference tool for skill gem imbuement outcomes. Single-page React app that displays skill gems, their colors (red/green/blue), and supported gem combinations. Deployed to GitHub Pages at `/poe-imbued-gem-reference/`.

## Commands

- **Dev server:** `bun run dev`
- **Build:** `bun run build` (copies data file, typechecks, then builds to `docs/`)
- **Tests:** `bun run test` (single run) / `bun run test:watch`
- **Lint:** `bun run lint` (biome check) / `bun run lint:fix` (auto-fix)
- **Format:** `bun run format`
- **Typecheck:** `bun run typecheck`

## Tech Stack

- React 19, TypeScript, Vite, Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- shadcn/ui (new-york style, stored in `src/components/ui/`)
- Fuse.js for fuzzy search (lazy-loaded)
- Biome for linting/formatting (single quotes, 2-space indent, 100 char line width)
- Vitest + Testing Library + jsdom for tests
- Bun as package manager (use `bun` not `npm`/`yarn`)
- Pre-commit hooks via Lefthook: runs biome check + typecheck on staged files
- Commit messages must follow Conventional Commits (enforced by commitlint)

## Architecture

**Data flow:** `data/poe_skill_support_compatibility.json` → copied to `public/data.json` at build time → fetched at runtime by `useGemData` hook → flattened from `{ color: { name: supports[] } }` into `SkillGem[]` sorted alphabetically.

**State management:** All UI state lives in `useSkillSearch` hook, which syncs search query, color filter, expanded rows, sort order, and "search supports" toggle to the URL hash (`#?q=...&c=...&e=...&s=1&sort=...`). Query changes use `replaceState` (debounced); other changes use `pushState` for back/forward support.

**Pinned skills:** `usePinnedSkills` hook persists pinned gem names to localStorage (`imbued-pinned-v1`).

**Path alias:** `@/` maps to `src/` (configured in vite and tsconfig).

## Testing

Tests use a global fetch mock (in `src/test/setup.ts`) that returns fixture data from `src/test/fixtures.ts`. Each test resets `location.hash` and `localStorage` via `beforeEach` in setup.
