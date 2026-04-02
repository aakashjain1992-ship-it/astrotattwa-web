# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astrotattwa is a Vedic astrology web application that generates birth charts (Kundli) using Swiss Ephemeris calculations. No login required for chart calculation. Charts are stored in localStorage on the client side, with optional save-to-database for authenticated users.

**Live:** https://astrotattwa.com | **Server:** Linode VPS at `/var/www/astrotattwa-web` | **Process:** PM2 (`astrotattwa-web`)

## Commands

```bash
npm run dev              # Start dev server (webpack, not Turbopack)
npm run build            # Production build (512MB memory limit)
npm run lint             # ESLint via next lint
npm run type-check       # TypeScript check (tsc --noEmit)
npm start                # Start production server
pm2 restart astrotattwa-web  # Restart production process
```

Note: `next.config.js` sets `ignoreBuildErrors: true` for TypeScript — type errors won't fail the build. Run `npm run type-check` separately.

## Tech Stack

- **Framework:** Next.js 16 (App Router, webpack) with React 18 and TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, Radix primitives) + Framer Motion
- **Backend:** Supabase (PostgreSQL 15, Auth via SSR cookies), Swiss Ephemeris (`swisseph` - server-external package)
- **State:** Component-local useState + localStorage (`lastChart` key) + custom hooks. No global store.
- **Forms:** React Hook Form + Zod validation schemas (in `src/lib/validation/`)
- **Testing:** Vitest and @testing-library/react are installed but **no tests exist** — zero `.test.ts` or `.spec.ts` files.
- **Deployment:** GitHub Actions → SSH to Linode → `npm install && npm run build && pm2 restart`

## Architecture

### Calculation Flow

1. User submits birth data via `BirthDataForm` → POST `/api/calculate`
2. Server calls Swiss Ephemeris (`src/lib/astrology/kp/calculate.ts`) using KP (Krishnamurti Paddhati) system
3. Returns planet positions, houses, KP data (star lord, sub-lord, sub-sub-lord)
4. Client stores result in localStorage, redirects to `/chart`
5. `ChartClient.tsx` reads localStorage and renders tabbed chart view

### Key Directories

- `src/lib/astrology/` — Core calculation engine (~42 files): KP system (`kp/`), planet strength (`strength/` — 18 files), Saturn transits (`sadesati/` — 8 files), divisional chart builder
- `src/lib/astrology/kp/calculate.ts` — Main birth chart calculation entry point
- `src/lib/astrology/kp/dasa.ts` — Vimshottari Dasha: 4 levels (Mahadasha → Antardasha → Pratyantar → Sookshma)
- `src/lib/astrology/divisionalChartBuilder.ts` — Unified builder for all 20 divisional charts (D1-D60, 664 lines)
- `src/lib/astrology/strength/` — Planetary strength analysis engine (functional nature, dignity, varga, domain engines)
- `src/lib/astrology/sadesati/` — Saturn transit (Sade Sati) analysis: `periodAnalyzer.ts` (1545 lines), `calculator-PROFESSIONAL.ts` (1183 lines)
- `src/lib/utils/divisional/` — Individual D2-D60 chart calculation files (legacy, mostly superseded by divisionalChartBuilder)
- `src/lib/utils/chartHelpers.ts` — House building functions (Lagna, Moon, Navamsa)
- `src/components/chart/` — Chart display: `ChartClient.tsx` (main page, 676 lines), `PlanetsTab.tsx` (planet data, 1414 lines), `DashaNavigator.tsx` (694 lines), `SadeSatiTableView.tsx` (839 lines), `DivisionalChartsTab.tsx`
- `src/components/forms/` — Birth data forms with city autocomplete
- `src/components/ui/` — shadcn/ui components (do not manually edit, use `npx shadcn-ui@latest add`)
- `src/types/astrology.ts` — Central type definitions for all astrology entities (PlanetData, ChartData, HouseInfo, KPData, etc.)
- `src/types/chart-calculation.ts` — API request/response types

### API Endpoints

| Route | Purpose |
|-------|---------|
| `/api/calculate` | Birth chart calculation (rate limited) |
| `/api/dasha/mahadashas`, `/antardasha`, `/sookshma`, `/pratyantar`, `/current` | Dasha period queries |
| `/api/avakahada` | Divisional strength analysis |
| `/api/transits/saturn/sadesati`, `/period-analysis` | Saturn transit (Sade Sati) |
| `/api/save-chart` | Chart CRUD (requires auth) |
| `/api/cities/search` | City autocomplete for birth location |
| `/api/auth/login`, `/logout`, `/me` | Authentication |

### Auth & Middleware

`middleware.ts` handles Supabase session refresh, protects `/settings` and `/reports`, and passes user info to API routes via `x-user-*` headers. Uses chunked cookies for large auth tokens.

### Error Handling

Centralized in `src/lib/api/errorHandling.ts` — use `successResponse()`, `errorResponse()`, `validationError()`, etc. Rate limiting presets in `src/lib/api/rateLimit.ts` (strict: 5/min, normal: 20/min, loose: 100/min).

## Conventions

- Path alias: `@/*` maps to `src/*`
- Fonts: Instrument Serif (headings), DM Sans (body) — loaded in root layout
- Theme: CSS variables in `globals.css` with light/dark mode via `next-themes` (class strategy)
- `swisseph` must stay in `serverExternalPackages` in next.config.js — it's a native Node module that cannot be bundled
- Commit style: `type(scope): description` (e.g., `refactor(divisional): consolidate chart calculations`)
- The owner uses both Claude and ChatGPT — see `AI_HANDOFF_GUIDE.md` for session handoff protocol

## Known Issues

### Removed Dependencies (were installed but unused — uninstalled March 2026)
- `zustand` — zero imports; all state is useState + custom hooks
- `@tanstack/react-query` — zero imports; API calls use raw fetch
- `@sentry/nextjs` — only commented-out integration in errorLogger.ts
- `@storybook/nextjs` — never configured, no stories

### Active but non-obvious dependency
- `resend` — used in `scripts/send-audit-email.ts` for admin audit emails, and via direct HTTP in `scripts/transit-db/*.js` for notifications. NOT used in src/ (forgot-password uses `supabase.auth.resetPasswordForEmail()`).

### Documentation Notes (updated March 29, 2026)
Root .md files were bulk-updated on March 29, 2026. Key fixes applied: Next.js version, phase status, LOC counts, table counts, auth status. Remaining known gaps:

| File | Status | Remaining Issues |
|------|--------|-----------------|
| **README.md** | Updated | package.json version still 0.1.0 vs documented 0.2.0; directory tree doesn't show all current dirs |
| **DEVELOPMENT_ROADMAP.md** | Partially updated | Header/status updated; detailed Phase 2/3 task sections still have old "Week N" estimates |
| **PROGRESS_TRACKER.md** | Updated | Saturn Transit and Planetary Strength features still not tracked as separate P-items |
| **COMPONENT_LIBRARY.md** | Minor gaps | Missing PlanetsTab, SadeSati components |
| **DELIVERY_SUMMARY.md** | Intentionally frozen | Phase 1 delivery doc — metrics are historical (Feb 7, 2026) |
| **CODE_REFACTORING_GUIDE.md** | Accurate | No issues |
| **SETUP_CHECKLIST.md** | Accurate | No issues |

### Database Tables (12 in Supabase)
`profiles`, `charts`, `cities`, `reports`, `payments`, `test_cases`, `test_case_runs`, `astronomical_events`, `auth_login_attempts_v2`, `auth_login_events`, `planet_daily_positions`, `planet_retrograde_periods`, `planet_sign_transits`, `transit_generation_log`. Note: the migration file (`supabase/migrations/001_initial_schema.sql`) only defines 4 tables — the rest were created directly in Supabase.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side admin operations
- `NEXT_PUBLIC_SITE_URL` — App URL for security headers/redirects
- `RESEND_API_KEY` — Email service
- `HERE_MAPS_API_KEY` — Location/geocoding (optional)
- `ADMIN_SECRET_TOKEN` — Admin/test endpoints
