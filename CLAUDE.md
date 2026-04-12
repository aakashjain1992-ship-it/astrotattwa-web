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

**Deploy sequence (production):** `pm2 stop astrotattwa-web && rm -rf .next && NODE_OPTIONS='--max-old-space-size=512' npx next build --webpack && pm2 restart astrotattwa-web && pm2 save` — stop PM2 first (only 957MB RAM on the server). A running PM2 + Next.js build = OOM kill.

## Tech Stack

- **Framework:** Next.js 16 (App Router, webpack) with React 18 and TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, Radix primitives) + Framer Motion
- **Backend:** Supabase (PostgreSQL 15, Auth via SSR cookies), Swiss Ephemeris (`swisseph` - server-external package)
- **State:** Component-local useState + localStorage (`lastChart` key) + custom hooks. No global store.
- **Forms:** React Hook Form + Zod validation schemas (in `src/lib/validation/`)
- **Rate Limiting:** Upstash Redis (`@upstash/ratelimit`) — presets in `src/lib/api/rateLimit.ts`
- **Testing:** Vitest and @testing-library/react are installed but **no tests exist** — manual testing via `/api/test/run-calculations`
- **Deployment:** GitHub Actions → SSH to Linode → `npm install && npm run build && pm2 restart`

## Architecture

### Calculation Flow

1. User submits birth data via `BirthDataForm` → POST `/api/calculate`
2. Server calls Swiss Ephemeris (`src/lib/astrology/kp/calculate.ts`) using KP (Krishnamurti Paddhati) system
3. Returns planet positions, houses, KP data (star lord, sub-lord, sub-sub-lord)
4. Client stores result in localStorage (`lastChart` key), redirects to `/chart`
5. `ChartClient.tsx` reads localStorage and renders tabbed chart view
   - `/chart` and `/chart/[id]` both render `ChartClient` — the `[id]` variant is set via `window.history.replaceState` when switching saved charts, not via Next.js navigation

### Saved Charts Flow

- `src/hooks/useSavedCharts.ts` — drives all CRUD: `saveChart`, `updateChart`, `deleteChart`, `refresh`. Uses `supabase.auth.getSession()` (cookie, no network) for instant auth check.
- `BirthDataFormWrapper` consumes `useSavedCharts` and passes `savedCharts` + `showSavedCharts` into `BirthDataForm` — the dropdown pre-fills the form when a saved chart is selected.
- On the chart page, selecting a saved chart calls `handleSelectSavedChart` → recalculates via `handleEditSubmit` → updates URL to `/chart/[id]` via `window.history.replaceState` (no remount).
- Tab switching uses `window.history.replaceState` (not `router.replace`) to append `?tab=…` — this avoids a full-page reload when the URL has been moved to `/chart/[id]` by replaceState but Next.js still considers the route to be `/chart`.
- `is_favorite` = the user's default "My Chart". API enforces uniqueness: clears all others before setting a new default. Header "My Chart" click finds the favorite, recalculates, and navigates via `window.location.href = '/chart'`.
- `ChartLabelModal` — save/edit label + is_favorite checkbox (Radix Dialog)
- `DeleteChartDialog` — confirm-delete modal (Radix AlertDialog)

### Key Directories

- `src/lib/astrology/` — Core calculation engine (~42 files): KP system (`kp/`), planet strength (`strength/` — 18 files), Saturn transits (`sadesati/` — 8 files), divisional chart builder
- `src/lib/astrology/kp/calculate.ts` — Main birth chart calculation entry point
- `src/lib/astrology/kp/dasa.ts` — Vimshottari Dasha: 4 levels (Mahadasha → Antardasha → Pratyantar → Sookshma)
- `src/lib/astrology/divisionalChartBuilder.ts` — Unified builder for all 20 divisional charts (D1–D60; 19 sub-files in `src/lib/utils/divisional/`)
- `src/lib/astrology/strength/` — Planetary strength analysis engine (functional nature, dignity, varga, domain engines)
- `src/lib/astrology/sadesati/` — Saturn transit (Sade Sati) analysis: `periodAnalyzer.ts` (1545 lines), `calculator-PROFESSIONAL.ts` (1183 lines)
- `src/lib/panchang/` — Daily Panchang engine (12 files) — see section below
- `src/lib/utils/divisional/` — Individual D2-D60 chart calculation files (legacy, mostly superseded by divisionalChartBuilder)
- `src/lib/utils/chartHelpers.ts` — House building functions (Lagna, Moon, Navamsa)
- `src/components/chart/` — Chart display components: `PlanetaryTable.tsx` (sorted in KP order), `PlanetsTab.tsx`, `DashaNavigator.tsx`, `AvakhadaTable.tsx`, `ChartFocusMode.tsx` (D1/Moon/D9 visual charts), `ChartLabelModal.tsx` (save/rename + is_favorite), `DeleteChartDialog.tsx`
- `src/components/chart/sadesati/` — `SadeSatiTableView.tsx` + supporting components
- `src/components/chart/divisional/` — `DivisionalChartsTab.tsx` + config/selector/insights
- `src/components/forms/` — Birth data forms with city autocomplete
- `src/components/panchang/` — Panchang display sections (15 files): `DateNavigator`, `PanchangHeader`, `sections/` (14 section components for each panchang element)
- `src/components/ui/` — shadcn/ui components (do not manually edit, use `npx shadcn-ui@latest add`)
- `src/types/astrology.ts` — Central type definitions for all astrology entities (PlanetData, ChartData, HouseInfo, KPData, etc.)
- `src/types/chart-calculation.ts` — API request/response types

### Panchang Module (`src/lib/panchang/`)

`compute.ts` is the single entry point — it orchestrates all sub-modules via `Promise.all` for parallel execution.

| File | Responsibility |
|------|---------------|
| `compute.ts` | Orchestrator — assembles full `PanchangData`; only file to call |
| `ephemeris.ts` | Sunrise/sunset/moonrise/set, planet positions, Julian day conversions |
| `core.ts` | The five Pancha elements: Tithi, Nakshatra, Yoga, Karana, Vara |
| `timings.ts` | All muhurta windows: Brahma, Abhijit, Vijaya, Rahu Kalam, Dur Muhurtam, etc. |
| `udayaLagna.ts` | Rising ascendant slots throughout day + Panchaka type classification |
| `specialYogas.ts` | Auspicious/inauspicious yoga combination detection |
| `chandrabalam.ts` | Moon-rashi-based favorability (6 rashis from current Moon) |
| `anandadi.ts` | Anandadi Yoga (27-cycle + Tamil 28-cycle) + Nivas/Shool calculations |
| `calendar.ts` | Vikram Samvat, Shaka Samvat, Ritu, Ayana, other calendar epochs |
| `constants.ts` | Lookup tables: rashi/nakshatra/karana names, Mantri Mandala (500+ VS years), Homahuti, Panchaka |
| `types.ts` | All Panchang interfaces: `PanchangData`, `NakshatraEntry`, `TimedEntry`, `PanchakaSlot`, etc. |
| `festivals.ts` | Festival lookups — **always fetched fresh, never cached** (fetched from `festival_calendar` table on every request to avoid stale data when festival records change) |

**`TimedEntry` pattern:** `{ value: string, endTime: LocalTime | null }` — used for tithi, nakshatra, yoga, karana, and other day-spanning values that can transition mid-day. A `null` endTime means the value extends past the display window.

**`NakshatraEntry.index` is 1-indexed (1–27).** Functions like `computeTarabalam` expect 0-indexed — always pass `index - 1`.

### Panchang API Cache

Cache key: `${CACHE_VERSION}_${dateParam}_${lat.toFixed(2)}_${lng.toFixed(2)}`

- Stored in Supabase `panchang_cache` table; TTL 24 hours
- `CACHE_VERSION` in `src/app/api/panchang/route.ts` — **bump this constant whenever the data shape or calculation logic changes**, otherwise stale Supabase rows are returned to clients
- Current version: `v8` (Anandadi/Tamil Yoga formula rewritten + all lookup tables corrected, Homahuti/Dur Muhurtam/Shivavasa/Agnivasa fixes, Apr 2026)
- Coordinates rounded to 2 decimal places (~1.2 km precision) — locations within ~1 km share a cache entry
- Festivals are fetched separately from `festival_calendar` table on every request (not cached)

### API Endpoints

| Route | Purpose |
|-------|---------|
| `/api/calculate` | Birth chart calculation (rate limited) |
| `/api/dasha/mahadashas`, `/antardasha`, `/sookshma`, `/pratyantar`, `/current` | Dasha period queries (split by level to match UI tab navigation) |
| `/api/avakahada` | Divisional strength analysis |
| `/api/transits/saturn/sadesati`, `/period-analysis` | Saturn transit (Sade Sati) |
| `/api/panchang` | Daily Panchang data (date + lat/lng); `/api/panchang/ip-location` for auto-location |
| `/api/save-chart` | Chart CRUD (GET list, POST create — requires auth) |
| `/api/save-chart/[id]` | PATCH update, DELETE — requires auth; PATCH clears other `is_favorite` when setting new default |
| `/api/cities/search` | City autocomplete (uses HERE Maps API) |
| `/api/auth/login`, `/logout`, `/me` | Authentication |
| `/auth/callback` | Supabase OAuth callback handler |
| `/api/test/run-calculations`, `/history`, `/delete-runs` | Manual regression testing (requires `ADMIN_SECRET_TOKEN`); UI at `/admin/tests` |
| `/api/horoscope` | GET: fetch horoscope by type/rashi/sign_type/date; fallback to latest if not found |
| `/api/horoscope/history` | GET: past N horoscopes (7 daily / 4 weekly / 6 monthly) |
| `/api/horoscope/generate` | POST: generate all 12 rashis for a type/date (protected by `ADMIN_SECRET_TOKEN`) |

### Auth & Middleware

`middleware.ts` handles Supabase session refresh, protects `/settings` and `/reports`, and passes user info to API routes via `x-user-*` headers. Uses chunked cookies for large auth tokens.

**Client-side auth pattern:** Use `useAuth()` hook (`src/hooks/useAuth.ts`) for component-level auth state — it calls `supabase.auth.getUser()` on mount and subscribes to `onAuthStateChange`. For a one-shot auth check inside a non-component context (e.g. inside `useSavedCharts`), use `supabase.auth.getSession()` (reads cookie instantly, no network). Never use `fetch('/api/auth/me')` for UI — that adds a 2–3s delay. `/api/auth/me` is server-to-server only.

**Other client hooks:**
- `useIdleLogout` — auto-logout after inactivity; mount once in the root layout
- `useVargottama(d1Houses, d9Houses)` — returns Vargottama planet list + insights
- `useDateTimeSync` — syncs date/time picker state across components

### Error Handling

Centralized in `src/lib/api/errorHandling.ts` — use `successResponse()`, `errorResponse()`, `validationError()`, etc. Rate limiting presets in `src/lib/api/rateLimit.ts`: `strict` (5/min), `standard` (20/min), `lenient` (60/min — used for Panchang and horoscope), `auth` (very strict). There is no `loose` preset.

## Conventions

- Path alias: `@/*` maps to `src/*`
- Fonts: Instrument Serif (headings), DM Sans (body) — loaded in root layout
- Theme: CSS variables in `globals.css` with light/dark mode via `next-themes` (class strategy)
- `swisseph` must stay in `serverExternalPackages` in `next.config.js` — it's a native Node module that cannot be bundled
- Commit style: `type(scope): description` (e.g., `fix(panchang): correct vijaya muhurta to 11th of 15-muhurta system`)
- The owner uses both Claude and ChatGPT — see `AI_HANDOFF_GUIDE.md` for session handoff protocol

### Horoscope Module (`src/lib/horoscope/`)

General (non-user-specific) horoscopes for all 12 rashis — daily, weekly, monthly. Moon sign only (sun sign disabled).

- `config.ts` — AI provider + per-type model (`daily: haiku`, `weekly/monthly: sonnet`)
- `rashiMap.ts` — 12 rashis with slug, sign number, EN/HI names, symbol; `getHouseFromTransit()` for house calculations
- `prompts.ts` — builds `PromptParts { system, dataBlock, langBlock }` per type; system+dataBlock marked cacheable; type-specific field guides (daily=full detail, weekly=insight, monthly=strategy)
- `generator.ts` — 4 parallel AI calls: 2×EN generation (6 rashis each) + 2×HI translation (6 rashis each); upserts to `horoscopes` table

**Generation schedule** (cron runs as PM2 `horoscope-cron`):
- Daily: midnight IST (18:30 UTC) → generates for IST date
- Weekly: Sunday noon IST (06:30 UTC) → generates for next week (Monday date)
- Monthly: 25th midnight IST (18:30 UTC on 24th) → generates for next month

**Manual trigger:** `node scripts/horoscope/generate.js [daily|weekly|monthly] [YYYY-MM-DD]`

**`horoscopes` table:** `rashi, type, sign_type, period_start, period_end, content_en (jsonb), content_hi (jsonb), planet_context (jsonb)` — UNIQUE on `(rashi, type, sign_type, period_start)`

**`horoscope_generation_log` table:** per-run token usage, cost, duration, errors, prompt preview.

**Planet data used:** `planet_sign_transits`, `planet_retrograde_periods` (columns: `retrograde_start`, `direct_start`), `computePanchang` at Delhi reference coords, `festival_calendar`

**URLs:** `/horoscope/[type]/[rashi]` — SSR with SEO metadata. Redirects: `/horoscope` → `/horoscope/daily/aries`; logged-in users with a favorite chart auto-redirect to their Moon rashi.

**UI:** `HoroscopeShell` — lang preference in `localStorage` (`horoscope_lang`); Prev/Next nav inline with type tabs; history loaded on mount.

### Database Tables (18 in Supabase)
`profiles`, `charts`, `cities`, `reports`, `payments`, `test_cases`, `test_case_runs`, `astronomical_events`, `auth_login_attempts_v2`, `auth_login_events`, `planet_daily_positions`, `planet_retrograde_periods`, `planet_sign_transits`, `transit_generation_log`, `panchang_cache`, `festival_calendar`, `horoscopes`, `horoscope_generation_log`. Note: `supabase/migrations/001_initial_schema.sql` only defines 4 tables; `supabase/panchang_tables.sql` defines 2 more — the rest were created directly in Supabase.

## Known Issues

### Active but non-obvious dependency
- `resend` — used in `scripts/send-audit-email.ts` for admin audit emails, and via direct HTTP in `scripts/transit-db/*.js` for notifications. NOT used in src/ (forgot-password uses `supabase.auth.resetPasswordForEmail()`).

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side admin operations
- `NEXT_PUBLIC_SITE_URL` — App URL for auth callbacks (fallback: https://astrotattwa.com)
- `NEXT_PUBLIC_APP_URL` — App URL for CORS headers in `next.config.js` (fallback: https://astrotattwa.com)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis for rate limiting
- `RESEND_API_KEY` — Email service (scripts only, not used in src/)
- `HERE_MAPS_API_KEY` — Location/geocoding for city search (optional)
- `ADMIN_SECRET_TOKEN` — Protects `/api/horoscope/generate` and test endpoints
- `ANTHROPIC_API_KEY` — AI generation for horoscopes
- `APP_INTERNAL_URL` — Internal URL for cron→app HTTP calls (default: `http://localhost:3000`)
