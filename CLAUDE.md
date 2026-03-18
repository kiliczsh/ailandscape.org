# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `make` for common tasks:

```
make format         # biome format --write
make fix            # biome check --write (auto-fix lint issues)
make lint           # biome check
make build          # next build
make dev            # next dev
make validate       # validate YAML structure + tags
```

Or directly with npm:

```
npm run format
npx biome check --write
npm run lint
npm run build
npm run dev
```

## Workflow

Follow this exact sequence for every logical unit of work:

1. **Make changes** — implement one concern at a time
2. **Format** — `make format`
3. **Fix** — `make fix` (auto-fix lint issues)
4. **Lint** — `make lint` (must pass with zero errors)
5. **Build** — `make build` (must compile cleanly)
6. **Commit** — commit immediately after each passing unit

**Never skip the commit step.** Each logical unit (component, config change, fix) gets its own commit before moving on.

**Commit style:**
- Conventional commits, lowercase, short: `feat: add hero section`, `fix: broken layout on mobile`, `chore: update deps`
- Never bundle large changes into a single commit — split by logical unit (component, feature, fix)
- One concern per commit; if you can't describe it in one short line, split it further

## Architecture

Next.js 16 App Router project with TypeScript, Tailwind CSS v4, and Biome for linting/formatting.

- `src/app/` — App Router pages and layouts. `layout.tsx` is the root layout with Geist font setup. `page.tsx` is the home route.
- `src/app/globals.css` — Global styles including Tailwind imports.
- `public/` — Static assets served at root.

**Icons:** Always use `@phosphor-icons/react` — never lucide-react or any other icon library.

**Tooling:**
- **Biome** (`biome.json`): handles both formatting (2-space indent) and linting with Next.js + React recommended rules. Import organization is automatic.
- **Tailwind CSS v4** via `@tailwindcss/postcss`.
- **TypeScript** strict mode via `tsconfig.json`.

No test framework is configured yet.

## Plans & Tracking

All persistent project context lives in `.claude/plans/`. Always read the relevant file before starting work; always update it after completing work.

| File | Purpose | When to consult |
|------|---------|-----------------|
| `audit-YYYY-MM-DD.md` | Quality audit — open findings, score history, positive patterns | Before any `/audit`, `/harden`, `/polish` run; update after each pass |
| `backlog.md` | Feature and design backlog — prioritised items not yet started | Before picking up new work; update when items are added, started, or shipped |

**Conventions:**
- Audit file: one file per audit date; update in-place as passes complete rather than creating new files.
- Backlog: mark items `In Progress` when starting, `Done` + commit SHA when shipped.
- If a `/audit` surfaces new findings, add them to the audit file before fixing; update again after fixing.

## Design Context

### Users
Technical users (developers, researchers, AI practitioners) exploring the AI tools ecosystem. They scan quickly, compare tools, and navigate category hierarchies. Secondary: non-technical stakeholders seeking a visual overview.

### Brand Personality
Open, approachable, and comprehensive. Tone: informative, welcoming, visually stimulating. Feels like a well-organized community resource — not a corporate product or exclusive tool.

**Three words:** Open. Vibrant. Navigable.

### Aesthetic Direction
Dense and information-rich: maximize visible data per screen, compact cards, tight but legible spacing. Reference: CNCF Landscape. Light mode default, full dark mode support.

- **Not:** sparse, minimal-whitespace-obsessed, dark-only
- **Yes:** colorful category navigation, efficient grids, visible data density

### Design Principles
1. **Hierarchy through color** — Distinct, vibrant accent colors for categories and subcategories aid quick orientation. Each category should feel visually distinct.
2. **Information density first** — Prefer compact layouts. Whitespace is purposeful, not generous. Maximize data per viewport.
3. **Accessible to all** — Approachable typography and clear labels. Color is never the sole differentiator. Good contrast without formal WCAG target.
4. **Consistent visual language** — Phosphor icons exclusively, OKLCH color tokens in globals.css, shadcn/Radix component primitives.
5. **Vibrancy with restraint** — Bold, distinct category colors; item cards stay neutral so content (not decoration) stands out.
