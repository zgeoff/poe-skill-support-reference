# Project: Imbued — PoE2 Gem Compatibility Reference

## Overview
A mobile-first, dark-themed static site that presents Path of Exile 2 skill gem / support gem compatibility data in an instantly searchable format. Users see a list of skill gems, filterable via fuzzy search that matches against both skill names AND their compatible support names (enabling reverse lookup through the search bar).

## Data Source
- **File:** `data/poe_skill_support_compatibility.json` (~435KB)
- **Structure:** `{ "red": { "SkillName": ["Support1", ...] }, "green": {...}, "blue": {...} }`
- **Stats:** 532 skills (127 red, 191 green, 214 blue), 171 unique support gems

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | latest | Build tool, dev server, static output |
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | latest | Component primitives (built on Radix) |
| Fuse.js | 7.x | Client-side fuzzy search |
| Vitest | latest | Test runner (Vite-native, fast) |
| React Testing Library | latest | DOM-based component testing |
| @testing-library/user-event | latest | Realistic user interaction simulation |
| bun | latest | Package manager, script runner |

## Hosting
- GitHub Pages, deployed from `docs/` folder on `main` branch
- Vite `build.outDir` configured to output to `docs/`
- No server-side logic — fully static

## Project Structure

```
imbued/
├── SPECIFICATION.md
├── data/
│   └── poe_skill_support_compatibility.json   # Source data
├── site/                                       # Vite + React app
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   │   └── data.json                          # Copied from data/ at build time
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css                          # Tailwind directives + custom theme
│   │   ├── types.ts                           # Data type definitions
│   │   ├── lib/
│   │   │   ├── data.ts                        # Data loading + index building
│   │   │   ├── search.ts                      # Fuse.js setup + search logic
│   │   │   └── utils.ts                       # cn() helper, etc.
│   │   ├── hooks/
│   │   │   ├── useGemData.ts                  # Data fetching + state
│   │   │   ├── useSearch.ts                   # Search state + debounced query
│   │   │   ├── useHashState.ts                # URL hash sync
│   │   │   └── usePinnedSkills.ts             # Pinned skills state + localStorage
│   │   ├── components/
│   │   │   ├── ui/                            # shadcn/ui components (input, badge, etc.)
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ColorFilter.tsx
│   │   │   ├── PinnedSection.tsx              # Collapsible pinned skills section
│   │   │   ├── SkillList.tsx
│   │   │   ├── SkillRow.tsx
│   │   │   └── SupportPills.tsx
│   │   └── test/
│   │       ├── setup.ts                       # Test setup (jsdom, RTL matchers)
│   │       ├── fixtures.ts                    # Small subset of real gem data for tests
│   │       ├── App.test.tsx                   # Full integration tests
│   │       ├── search.test.tsx                # Search behavior integration tests
│   │       └── url-hash.test.tsx              # URL hash state tests
│   └── components.json                        # shadcn/ui config
├── docs/                                       # Built static output (for GitHub Pages)
│   ├── index.html
│   ├── assets/
│   └── data.json
```

## Design System

### Color Palette (Dark Theme)

**Backgrounds:**
- Page: `#0a0a0f`
- Surface (cards, inputs): `#12121a`
- Border: `#1e1e2e`
- Hover: `#1a1a2a`

**Text:**
- Primary: `#c8c4b8` (warm parchment)
- Muted: `#6b6a63`
- Bright: `#e8e4d8` (headings, emphasis)

**Gem Colors:**
- Red: `#c24b38` (accent), `#2a1510` (dim bg for pills)
- Green: `#3b9b47` (accent), `#0f2212` (dim bg)
- Blue: `#4169c9` (accent), `#101828` (dim bg)

**Focus/Accent:** Gold `#8b7a2e` (matches PoE currency aesthetic)

### Typography
- Font: Inter (Google Fonts)
- Base size: 14px mobile, 14px desktop
- Weights: 400 (body), 500 (labels), 600 (headings)

## UI Layout

Single-column, mobile-first. Max width ~640px centered.

```
┌─────────────────────────────────┐
│  Imbued                         │  ← Header (site name, subtitle)
├─────────────────────────────────┤
│  🔍 Search skills or supports… │  ← Sticky search bar
│  [All] [Red] [Green] [Blue]     │  ← Color filter pills
├─────────────────────────────────┤
│  ▾ Pinned (2)                   │  ← Collapsible pinned section header
│  ┌─────────────────────────────┐│
│  │ 📌 Arc               [37] 🔵││  ← Pinned skills (always visible,
│  │ 📌 Cyclone            [22] 🟢││    not affected by search/filter)
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  ▸ Cleave              [14]  🔴 │  ← Skill row (name, support count, color dot)
│  ▾ Arc                 [37]  🔵 │  ← Expanded (multiple can be open)
│  ┌─────────────────────────────┐│
│  │ Added Lightning · Spell Echo││  ← Support pills (flex-wrap)
│  │ Faster Casting · Inspiration││
│  │ Controlled Destr. · ...     ││
│  └─────────────────────────────┘│
│  ▾ Cyclone             [22]  🟢 │  ← Also expanded (multi-expand)
│  ┌─────────────────────────────┐│
│  │ Multistrike · Melee Phys   ││
│  │ ...                         ││
│  └─────────────────────────────┘│
│  ▸ Ball Lightning      [35]  🔵 │
│  ...                            │
└─────────────────────────────────┘
│  Footer (data credit, link)     │
```

## Components

### `<SearchBar />`
- Full-width text input with search icon and clear button
- `x-model` equivalent: controlled input with debounced state update
- Placeholder: "Search skills or supports..."
- Min height 44px (touch target)
- Uses shadcn `Input` component

### `<ColorFilter />`
- Row of 4 pill buttons: All, Red, Green, Blue
- Active pill gets gem-colored background
- "All" uses gold accent
- Uses shadcn `Toggle` or custom pill buttons

### `<PinnedSection />`
- Collapsible section at the top of the skill list
- Header shows "Pinned (N)" with toggle to collapse/expand the section
- Pinned skills are always visible regardless of search query or color filter
- Each pinned skill row has an unpin button
- Section is only rendered when there are pinned skills
- Collapsed state persisted in localStorage

### `<SkillList />`
- Virtualized list (only if performance requires it — start without)
- Renders `<PinnedSection />` above filtered results
- Pinned skills are excluded from the main list to avoid duplicates
- Maps filtered results to `<SkillRow />` components
- Shows "No matching skills found" empty state with suggestion text

### `<SkillRow />`
- Clickable row, expands/collapses on click
- Multiple skills can be expanded simultaneously (not accordion-style)
- Left border in gem color (4px)
- Content: skill name, support count badge, color indicator, pin/unpin button
- Pin button: toggles pinned state, visually distinct when pinned
- Expand animation: height transition via CSS or Radix Collapsible
- Uses shadcn `Collapsible` component

### `<SupportPills />`
- Rendered inside expanded `<SkillRow />`
- Flex-wrapped grid of support gem names as badges
- Each pill uses dim gem-color background + bright gem-color text
- " Support" suffix stripped from names for brevity
- Uses shadcn `Badge` component

## Pinning Behavior

**`usePinnedSkills` hook:**
- Stores pinned skill names in `localStorage` under key `imbued-pinned`
- Provides `pin(name)`, `unpin(name)`, `togglePin(name)`, `isPinned(name)` methods
- No pin limit — users can pin as many as they want
- Pinned section is collapsible to mitigate clutter (collapsed state in localStorage)

**Behavior:**
- Pinned skills render in a dedicated `<PinnedSection />` at the top of the list
- Pinned skills are not affected by search queries or color filters — they always appear
- Pinned skills are excluded from the main search results list to prevent duplicates
- Pinned skills can be independently expanded/collapsed just like regular skills
- Pin/unpin via a small pin icon button on each `<SkillRow />`

## Search Behavior

**Fuse.js Configuration:**
```typescript
{
  keys: [
    { name: 'name', weight: 2 },        // Skill name (higher weight)
    { name: 'supports', weight: 1 }      // Support gem names
  ],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 1,
  includeScore: true,
  shouldSort: true
}
```

**Search data structure:**
```typescript
interface SearchableSkill {
  name: string;
  color: 'red' | 'green' | 'blue';
  supports: string;  // All support names joined as a single searchable string
}
```

**Behavior:**
- Empty query → show all skills alphabetically, filtered by color
- Non-empty query → fuzzy match against skill names + support names
- 150ms debounce on input
- Color filter applies as a post-filter on search results
- Typing a support name (e.g., "Multistrike") surfaces all skills compatible with that support

## URL Hash State

**Format:** `#?q=<query>&e=<expanded1>&e=<expanded2>&c=<color>`

**Examples:**
- `#?q=cleave` — searching for "cleave"
- `#?q=cleave&e=Cleave` — searching with Cleave expanded
- `#?e=Arc&e=Cyclone` — multiple skills expanded
- `#?c=blue` — filtered to blue gems
- `#?q=multistrike&e=Cyclone&c=green` — full state

**Notes:**
- Multiple `e` params supported for multi-expand
- Pinned skills are stored in localStorage, not the URL hash (pins are persistent across sessions)

**Implementation:**
- `useHashState` hook syncs state ↔ URL hash
- Supports browser back/forward navigation
- Debounced hash updates (avoid spamming history on every keystroke)
- `replaceState` for search query changes, `pushState` for expand/collapse

## Data Loading

1. App mounts, shows skeleton/loading state
2. `fetch('/data.json')` loads the compatibility data
3. Client-side processing:
   - Flatten into `SearchableSkill[]` array
   - Build Fuse.js index
4. Check URL hash for initial state
5. Render results

## Responsive Breakpoints

| Element | Mobile (<640px) | Desktop (>=640px) |
|---------|-----------------|---------------------|
| Container | full width, `px-4` | `max-w-2xl mx-auto` |
| Search input | `h-12` | `h-11` |
| Skill rows | `py-3` | `py-2.5` |
| Support pills | `text-xs gap-1.5` | `text-xs gap-2` |
| Header subtitle | hidden | visible |

## Testing Strategy

**Philosophy: Testing Trophy (not pyramid)**
Focus on integration tests that exercise real user behavior through the rendered UI. Minimal unit tests — only where pure logic benefits from isolation. No snapshot tests. No implementation detail testing.

**Stack:**
- **Vitest** — test runner, configured via `vite.config.ts` (shares Vite's transform pipeline)
- **React Testing Library (RTL)** — render components, query by accessible roles/text
- **@testing-library/user-event** — simulate realistic user interactions (typing, clicking)
- **jsdom** — browser environment for Vitest

**Test setup (`src/test/setup.ts`):**
- Import `@testing-library/jest-dom/vitest` for DOM matchers (`toBeInTheDocument`, etc.)
- Mock `fetch` to return test fixture data
- Reset URL hash between tests
- Clear localStorage between tests (pinned state)

**Test fixtures (`src/test/fixtures.ts`):**
- Small representative subset of real data (~10 skills across all 3 colors, ~15 supports)
- Includes edge cases: skill with 0 supports, skill with many supports, unicode names

**Integration test files:**

### `App.test.tsx` — Core user journeys
- Renders the full `<App />`, asserts loading state then populated list
- User sees all skills listed alphabetically on initial load
- User clicks a skill row → support pills appear
- User clicks the same row again → pills collapse
- Multiple skills can be expanded simultaneously
- Color filter: clicking "Red" shows only red skills, clicking "All" resets
- Empty state: nonsense query shows "No matching skills found"
- Pinning: user pins a skill → it appears in pinned section at top
- Pinning: pinned skills persist through search/filter changes
- Pinning: user can collapse/expand the pinned section
- Pinning: unpinning removes skill from pinned section back to main list

### `search.test.tsx` — Search behavior
- Typing a skill name filters the list to matching skills
- Typing a support name filters to skills that have that support (reverse lookup)
- Fuzzy matching: partial/misspelled input still surfaces correct results
- Clearing the search input restores the full list
- Search + color filter combine correctly (e.g., search "fire" + filter "blue")
- Debounce: rapid typing doesn't cause excessive re-renders

### `url-hash.test.tsx` — URL hash persistence
- Expanding a skill updates the URL hash
- Loading the app with a hash pre-selects the correct state (query, expanded, color)
- Changing the search query updates the hash
- Color filter changes reflected in hash

**Running tests:**
```bash
cd site
bun run test           # Run all tests once
bun run test:watch     # Watch mode during development
```

**Vitest config (in `vite.config.ts`):**
```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
}
```

## Edge Cases

1. **Skills with 0 supports** (e.g., "Automation"): Show "No compatible supports" in expanded view
2. **Large expanded panels** (up to 43 supports): Pills wrap naturally, scroll-into-view on expand
3. **Unicode** (e.g., "Maelström"): UTF-8 encoding, `encodeURIComponent` for URL hash
4. **Initial load with hash**: Defer hash processing until data is loaded

## Build & Deploy

```bash
cd site
bun install
bun run build          # Outputs to ../docs/
```

**Vite config notes:**
- `build.outDir: '../docs'`
- `base: '/poe-imbued-gems/'`
- Prebuild script in `package.json` copies `data/poe_skill_support_compatibility.json` → `site/public/data.json`

**GitHub Pages setup:**
- Settings → Pages → Source: Deploy from branch
- Branch: `main`, folder: `/docs`

## Non-Goals (v1)

- No Vaal gem toggle
- No skill comparison mode
- No keyboard navigation (beyond native browser)
- No PWA / offline support
- No external links to poedb/wiki
- No server-side rendering
