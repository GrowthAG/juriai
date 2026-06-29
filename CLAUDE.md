# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above is load-bearing: this repo runs **Next.js 16.2.9**, which has breaking
> changes vs. older versions. Before writing Next.js code, read the relevant guide under
> `node_modules/next/dist/docs/` (`01-app` for App Router, `03-architecture`, etc.).

## Project

JuriAI — a legal operating system for Brazilian law firms ("plataforma jurídica
anti-alucinação"). UI, code comments, and content are in **Portuguese (pt-BR)**.

## Commands

```bash
npm run dev            # next dev (http://localhost:3000)
npm run dev:3002       # dev on port 3002
npm run build          # next build
npm run lint           # eslint over app/ components/ lib/ e2e/
npm run test:e2e       # playwright (npx playwright test)
npm run test:e2e:ui    # playwright in UI mode

# Database (Cloud SQL Postgres — see "Data layer" below)
npm run proxy          # cloud-sql-proxy for juriai-app:us-central1:juriai-db on :5432
npm run db:check       # verify DATABASE_URL connectivity (scripts/check-db.mjs)
```

Run a single Playwright test: `npx playwright test e2e/<file>.spec.ts -g "<test name>"`.

Note: `package.json` references `db:init` / `db:patch` / `db:apply` scripts
(`scripts/init-db.mjs`, `scripts/apply-sql.mjs`) and `lint` targets `components/`,
`lib/`, `e2e/` — **none of these files/dirs currently exist**. Only `scripts/check-db.mjs`
is present. Don't assume they're there.

## Architecture

App Router project. Everything lives under `app/`, organized into **route groups** that
each own a layout and a client `shell.tsx`:

- `app/(marketing)/` — public site (blog, materiais/lead-magnets). Wrapped by
  `MarketingNav` + `MarketingFooter` from `app/_components/`.
- `app/(app)/` — the authenticated firm workspace (workspace, clients, cases, documents,
  evidences, tasks, members, assistant, settings). `shell.tsx` is the sidebar + topbar;
  `navItems` / `titleByPath` there define the nav.
- `app/(admin)/admin/` — platform-operator admin panel (escritórios, usuários, planos,
  auditoria, configurações). Has its own `shell.tsx`.
- Standalone routes: `app/page.tsx` (landing), `app/login/`, `app/onboarding/`.

**Per-group UI primitives**, imported with relative paths within the group:
- `app/(app)/_components/workspace-ui.tsx` — `WorkspacePageHeader`, `PrimaryButton`,
  `StatusBadge`, `FilterBar`, etc. Reach for these before hand-rolling workspace UI.
- `app/(admin)/admin/_components/admin-ui.tsx` — admin equivalents.
- `app/_components/` — shared marketing/global pieces (`icon.tsx`, `reveal.tsx`, nav, footer).

**Icons** come from a single registry: `app/_components/icon.tsx`, used as
`<Icon name="..." />`. Add new icons to that file and the `IconName` union — there's no
per-icon import.

### Data layer — current state vs. intent

The README and `package.json` describe a Prisma 5 + Postgres (Cloud SQL) + server-actions
app, and `.env` holds `DATABASE_URL` / `CLOUD_SQL_CONNECTION_NAME` / Stripe keys. **But the
current pages do not touch the database.** They are client components (`"use client"`)
driven by **mock data + `sessionStorage`**:
- Seed/fixture data lives in colocated `_data.ts` or `_components/*-data.ts` files
  (e.g. `app/(app)/cases/_components/case-data.ts`, `app/(marketing)/blog/_data.ts`).
- CRUD is local React state persisted to `window.sessionStorage` under keys like
  `juriai.cases.session` (see `loadStoredCases` / `writeStoredCases`).

When wiring real persistence, that's the boundary to replace — don't assume Prisma is
already plumbed into a page just because the dependency exists.

### Styling

Tailwind v4 (`@import "tailwindcss"` + `@theme inline` in `app/globals.css`) plus an
extensive **CSS custom-property design system** at the top of `globals.css`. Use the tokens
(`var(--primary)`, `var(--border)`, `var(--muted)`, `var(--danger)`, admin `--admin-*`,
etc.) rather than raw hex. Brand palette is **blue / gray / white / black** — `--primary`
is chromatic blue (`#0056d6`); **do not introduce green or copper accents**. Fonts: Inter
(`--font-inter`) and DM Serif Display (`--font-dm-serif`), loaded in `app/layout.tsx`.

Design source-of-truth docs live at the repo root: `DESIGN.md`, `DESIGN-10X.md`,
`DESIGN-TOOLS.md`, `BRAND.md`, `PRODUCT.md`, `BENCHMARK.md`. Consult these before
non-trivial UI work.

## Conventions

- Path alias: `@/*` → repo root (e.g. `@/app/_components/icon`).
- TypeScript is `strict`; route-group-internal imports use relative paths, cross-cutting
  imports use `@/`.
- Colocate route-specific data/components under the route's `_components/` or `_data.ts`
  (underscore-prefixed dirs are not routes).
