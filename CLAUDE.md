# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astrotattwa is a Vedic astrology web application that generates birth charts (Kundli) using Swiss Ephemeris calculations. No login required for chart calculation. Charts are stored in localStorage on the client side, with optional save-to-database for authenticated users.

**Live:** https://astrotattwa.com | **Server:** Linode 4 GB VPS (2 CPU, 4 GB RAM, Mumbai) at `/var/www/astrotattwa-web` | **Process:** PM2 (`astrotattwa-web`, cluster mode — 4 instances)

## Commands

```bash
npm run dev              # Start dev server (webpack, not Turbopack)
npm run build            # Production build (768MB memory limit)
npm run lint             # ESLint via next lint
npm run type-check       # TypeScript check (tsc --noEmit)
npm start                # Start production server
pm2 reload astrotattwa-web   # Reload production process (near-zero downtime)
```

Note: `next.config.js` sets `ignoreBuildErrors: true` for TypeScript — type errors won't fail the build. Run `npm run type-check` separately.

**Deploy sequence (production):** `npm run build && pm2 reload astrotattwa-web && pm2 save` — **NEVER stop PM2 before building.** Build first while the old server keeps serving from memory, then reload after. Do NOT `rm -rf .next` first. Use `pm2 reload` not `pm2 restart` — in cluster mode, reload does a rolling restart (one worker at a time, zero downtime). `npm run build` already sets `NODE_OPTIONS='--max-old-space-size=768'`. Server has 4 GB RAM total; PM2 workers use ~360 MB combined; build capped at 768 MB to leave headroom. (Was 512 MB — raised Apr 2026 because CI/CD `npm install` → `npm run build` sequence was OOMing at 484 MB.)

## Tech Stack

- **Framework:** Next.js 16 (App Router, webpack) with React 18 and TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (new-york style, Radix primitives) + Framer Motion
- **Backend:** Supabase (PostgreSQL 15, Auth via SSR cookies), Swiss Ephemeris (`swisseph` - server-external package)
- **Payments:** PhonePe (`pg-sdk-node` v2.0.3) — Standard Checkout, **Production** credentials configured, account activated (tested ₹1000 live, Apr 2026). Webhook registered at `/api/payment/webhook` for order, refund and dispute events.
- **State:** Component-local useState + localStorage (`lastChart` key) + custom hooks. No global store.
- **Forms:** React Hook Form + Zod validation schemas (in `src/lib/validation/`)
- **Rate Limiting:** Local Redis via `ioredis` — runs on `localhost:6379`, auto-starts on boot (`systemctl enable redis-server`). Atomic Lua script for cross-process correctness. Presets in `src/lib/api/rateLimit.ts`. Fails open (allows request) if Redis is down.
- **Testing:** Vitest and @testing-library/react are installed but **no tests exist** — manual testing via `/api/test/run-calculations`
- **Deployment:** GitHub Actions → SSH to Linode → `npm install && npm run build && pm2 reload astrotattwa-web`

## Architecture

### Calculation Flow

1. User submits birth data via `BirthDataForm` → POST `/api/calculate`
2. Server calls Swiss Ephemeris (`src/lib/astrology/core/calculate.ts`) using Lahiri ayanamsa + **Whole Sign** house system (classical Parashari Vedic)
3. Returns planet positions, houses, nakshatra data (star lord, sub-lord, sub-sub-lord via Vimshottari proportions), and Placidus cusps (`houseCusps`) for dev comparison only
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

- `src/lib/astrology/` — Core calculation engine (~42 files): core engine (`core/`), planet strength (`strength/` — 18 files), Saturn transits (`sadesati/` — 8 files), divisional chart builder
- `src/lib/astrology/core/calculate.ts` — Main birth chart calculation entry point (Lahiri ayanamsa + Whole Sign houses). Also returns `houseCusps` (12 Placidus cusp degrees) for dev toggle only — not used in production display
- `src/lib/astrology/core/dasa.ts` — Vimshottari Dasha: 4 levels (Mahadasha → Antardasha → Pratyantar → Sookshma)
- `src/lib/astrology/core/kpLords.ts` — Star lord / sub-lord / sub-sub-lord divisions within each nakshatra (Vimshottari proportion math on sidereal longitude)
- `src/lib/astrology/divisionalChartBuilder.ts` — Unified builder for all 20 divisional charts (D1–D60; 19 sub-files in `src/lib/utils/divisional/`)
- `src/lib/astrology/strength/` — Planetary strength analysis engine (functional nature, dignity, varga, domain engines)
- `src/lib/astrology/sadesati/` — Saturn transit (Sade Sati) analysis: `periodAnalyzer.ts` (1545 lines), `calculator-PROFESSIONAL.ts` (1183 lines)
- `src/lib/astrology/yogas/` — Yoga & Dosha detection engine (17 files): 26 yogas + 5 doshas, scoring (0-100), display priority, life-area aggregation. See "Yoga & Dosha Module" section below.
- `src/lib/panchang/` — Daily Panchang engine (12 files) — see section below
- `src/lib/utils/divisional/` — Individual D2-D60 chart calculation files (legacy, mostly superseded by divisionalChartBuilder)
- `src/lib/utils/chartHelpers.ts` — House building functions (Lagna, Moon, Navamsa)
- `src/lib/redis.ts` — Shared `ioredis` singleton (`getRedis()`); used by rate limiter and panchang cache; fails open on error
- `src/lib/auth/googleOneTap.ts` — Shared utils: `generateNonce()` (SHA-256 nonce pair) + `triggerGoogleOneTap(returnUrl)` (re-initializes One Tap with fresh nonce, falls back to `GET /api/auth/google` redirect if GSI not loaded)
- `src/components/auth/GoogleOneTap.tsx` — Auto-prompt component mounted in root layout; skips auth pages; triggers after `useAuth` confirms user=null
- `src/components/chart/` — Chart display components: `PlanetaryTable.tsx` (sorted by nakshatra lord order), `PlanetsTab.tsx`, `DashaNavigator.tsx`, `AvakhadaTable.tsx`, `ChartFocusMode.tsx` (D1/Moon/D9 visual charts), `ChartLabelModal.tsx` (save/rename + is_favorite), `DeleteChartDialog.tsx`, `DiamondChart.tsx` (renders the diamond-grid chart layout — used by both ChartFocusMode and DivisionalChartsTab; accepts `showAscLabel` to toggle Asc annotation)
- `src/components/chart/yogas/` — Yogas & Doshas tab: `YogasTab.tsx` (container), `YogaCard.tsx` / `DoshaCard.tsx` (two-tab layout: Your Chart | About), `YogaSummaryCard.tsx` (summary + strength distribution bar), `YogaList.tsx` (flat strength-sorted list), `TopPositiveYogas.tsx` / `ChallengingPatterns.tsx` (guest preview), `SignInModal.tsx` (dynamic title/description), `LifeAreaImpact.tsx`, `TechnicalDetailsAccordion.tsx` (supports `noWrapper` prop)
- `src/components/chart/sadesati/` — `SadeSatiTableView.tsx` + supporting components
- `src/components/chart/divisional/` — `DivisionalChartsTab.tsx` + config/selector/insights
- `src/components/forms/` — Birth data forms with city autocomplete. `CitySearch` uses a `userTyped` ref to prevent the results dropdown from auto-opening when the parent updates the `value` prop (e.g. after IP detection) — only opens on actual user keystrokes.
- `src/components/landing/` — Homepage hero visuals: `Galaxy.tsx` (canvas star/nebula animation, `position: fixed` to escape hero `overflow: hidden`, uses `window.innerWidth/Height` not `offsetWidth`, `MutationObserver` on `<html>` class for instant dark/light switch, `visibilitychange` listener pauses animation when tab is hidden to save CPU), `Yantra.tsx` (SVG with 9 orbiting planets using SVG `animateTransform`), `Particles.tsx`, `Glyphs.tsx`.
- `src/components/panchang/` — Panchang display sections (15 files): `DateNavigator`, `PanchangHeader`, `sections/` (14 section components for each panchang element)
- `src/components/ui/` — shadcn/ui components (do not manually edit, use `npx shadcn-ui@latest add`)
- `src/types/astrology.ts` — Central type definitions for all astrology entities (PlanetData, ChartData, HouseInfo, KPData, etc.)
- `src/types/chart-calculation.ts` — API request/response types

### Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage: Hero + BirthDataForm, Panchang + Horoscope teasers, Festival Calendar, Navagraha |
| `/chart` | Chart view — reads `lastChart` from localStorage |
| `/chart/[id]` | Saved chart view — URL set via `replaceState`, not Next.js nav |
| `/panchang` | Daily Panchang for user's location |
| `/horoscope/[type]/[rashi]` | SSR horoscope page; redirects `/horoscope` → `/horoscope/daily/aries` |
| `/numerology` | Lo Shu Grid numerology reading — form + tabbed report |
| `/numerology/compatibility` | Partner compatibility — two-person form + 5-tab CompatibilityReport |
| `/settings` | Protected; user account settings |
| `/admin/tests` | Manual regression test runner (requires `ADMIN_SECRET_TOKEN`) |
| `/(auth)/login` | Auth pages (grouped route, no shared layout with app) |
| `/terms` | Terms of Service (static) |
| `/privacy-policy` | Privacy Policy (static) — note: old `/privacy` route was deleted |

**Deleted routes:** `/preview` was merged into `/` (Apr 2026).

**SEO:** `src/app/sitemap.ts` generates `/sitemap.xml` automatically (40 URLs: static pages + all 36 horoscope combinations). `public/robots.txt` blocks `/admin/`, `/payment-test`, `/settings`, `/api/`. Horoscope pages (`/horoscope/[type]/[rashi]`) use `generateStaticParams` — all 36 are pre-built as SSG at deploy time.

### Header & Mobile Navigation

`src/components/layout/Header.tsx` contains a `MobileDrawer` component (defined in the same file, before `Header`). It renders as a full-height `position: fixed` side panel with a dimmed backdrop. Sub-menus (Horoscope, Numerology) are collapsed by default via `useState` — a `useEffect` resets them whenever the drawer closes. Bottom section shows Sign in for guests (solid blue button — no "Get started" button), or avatar + actions for logged-in users, with 44px bottom padding for iPhone home indicator. Desktop auth buttons are wrapped in `<div className="header-auth-desktop">` which is hidden via a media query in `globals.css` at ≤768px.

### PM2 Processes

| Process | Mode | Description |
|---------|------|-------------|
| `astrotattwa-web` | cluster (4 instances) | Next.js production server — 4 workers share port via Node.js cluster, zero-downtime rolling reload |
| `horoscope-cron` | fork (1 instance) | Runs `scripts/horoscope/cron.js` — generates daily/weekly/monthly horoscopes on schedule |

**Cluster notes:** `ecosystem.config.js` sets `exec_mode: "cluster", instances: 4`. `pm2 reload astrotattwa-web` does a rolling restart (one worker at a time). Rate limiting is shared across workers via local Redis (`src/lib/redis.ts` singleton — also shared with panchang cache). Do NOT switch to `npm` as the PM2 script — cluster mode requires a Node.js entry point (`node_modules/.bin/next`).

### Scripts (`scripts/`)

- `scripts/horoscope/generate.js` — Manual horoscope generation: `node scripts/horoscope/generate.js [daily|weekly|monthly] [YYYY-MM-DD]`
- `scripts/horoscope/cron.js` — Cron worker run by PM2 `horoscope-cron`
- `scripts/transit-db/` — Planet transit DB population: `generate-daily-positions.js`, `generate-planet-transits.js`, `transit-cron-worker.js`, `seed-transit-log.js`
- `scripts/seed-festivals.ts` — Seeds `festival_calendar` table
- `scripts/send-audit-email.ts` — Admin audit emails via Resend

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

**3-tier cache** (added Apr 2026):
1. **Redis (hot)** — `panchang:<cacheKey>` in local Redis; ~0.3 ms; TTL 24h via `setex`
2. **Supabase (warm)** — `panchang_cache` table; ~10 ms; backfills Redis on hit
3. **Compute (cold)** — Swiss Ephemeris calculation; writes to both Redis and Supabase

- `CACHE_VERSION` in `src/app/api/panchang/route.ts` — **bump this constant whenever the data shape or calculation logic changes**, otherwise stale rows are returned
- Current version: `v8` (Anandadi/Tamil Yoga formula rewritten + all lookup tables corrected, Homahuti/Dur Muhurtam/Shivavasa/Agnivasa fixes, Apr 2026)
- Coordinates rounded to 2 decimal places (~1.2 km precision) — locations within ~1 km share a cache entry
- Festivals are fetched separately from `festival_calendar` table on every request (not cached)
- Both Redis tiers fail open — if Redis is down, falls through to Supabase/compute normally

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
| `/api/user/theme` | GET/PATCH user theme preference — stored in `profiles.theme`; GET returns `null` if unset |
| `/api/auth/login`, `/logout`, `/me` | Authentication |
| `/api/auth/google` | GET: initiates custom Google OAuth — generates CSRF state, sets `google_oauth_state` cookie, redirects to Google |
| `/auth/google/callback` | GET: handles Google OAuth redirect — validates state, exchanges code, calls `signInWithIdToken`, sets session cookies |
| `/api/auth/google/onetap` | POST `{ credential, nonce }`: handles Google One Tap credential — calls `signInWithIdToken`, sets session cookies |
| `/auth/callback` | Supabase OAuth callback handler (email verification, password reset — keep this separate) |
| `/api/test/run-calculations`, `/history`, `/delete-runs` | Manual regression testing (requires `ADMIN_SECRET_TOKEN`); UI at `/admin/tests` |
| `/api/horoscope` | GET: fetch horoscope by type/rashi/sign_type/date; fallback to latest if not found |
| `/api/horoscope/history` | GET: past N horoscopes (7 daily / 4 weekly / 6 monthly) |
| `/api/horoscope/generate` | POST: generate all 12 rashis for a type/date (protected by `ADMIN_SECRET_TOKEN`) |
| `/api/numerology` | GET: saved readings list; POST: save reading — requires auth |
| `/api/numerology/[id]` | DELETE: remove saved reading — requires auth |
| `/api/numerology/compatibility` | GET: saved compatibility readings; POST: save — requires auth |
| `/api/numerology/compatibility/[id]` | DELETE: remove saved compatibility reading — requires auth |
| `/api/yogas` | POST: detect yogas + doshas from chart payload; persists to `charts.yoga_analysis` if `chartId` + auth supplied; works for guests too (rate limit: standard) |

### Theming Pattern

Any component with structural backgrounds or borders must be theme-aware. Two approaches used throughout the codebase:

1. **CSS variables** — structural elements use `hsl(var(--card))`, `hsl(var(--background))`, `var(--border)`, `var(--shadow-md)`. Dark mode overrides for flat tokens (`--text`, `--text2`, `--text3`, `--surface`, `--bg`, `--bg-subtle`, `--shadow-*`, etc.) are defined inside the `.dark {}` block in `globals.css`.

2. **`tw()` helper** — components with dynamic inline opacity values (borders, row backgrounds, separators) import `useTheme` and define:
   ```ts
   const { resolvedTheme } = useTheme()
   const isDark = resolvedTheme === 'dark'
   const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`
   ```
   This replaces all hardcoded `rgba(255,255,255,X)` values which are invisible in light mode. Components using this pattern: `PanchangTeaser`, `HoroscopeTeaser`, `FestivalCalendarSection`, `FestivalCalendarPage`.

**`/api/user/theme` (GET/PATCH):** Reads/writes `profiles.theme` using Supabase cookie auth (`createServerClient` + `getChunkedCookie`). GET returns `null` (not `'light'`) when no theme is stored — the Header only calls `setTheme()` when the API returns a non-null value, preventing the API from overwriting a locally-set dark theme on every page load. **Do not use `x-user-id` header in API routes** — middleware sets it on the *response*, not the request, so API routes never see it. Use `supabase.auth.getUser()` instead.

### Auth & Middleware

`middleware.ts` handles Supabase session refresh, protects `/settings` and `/reports`, and passes user info to API routes via `x-user-*` headers. Uses chunked cookies for large auth tokens.

**Custom Google OAuth flow (Apr 2026):** Built to avoid showing the Supabase-hosted OAuth URL (`*.supabase.co/auth`). Flow: "Continue with Google" button → `triggerGoogleOneTap(returnUrl)` (in `src/lib/auth/googleOneTap.ts`) → if Google One Tap is loaded, re-initializes with a fresh nonce + calls `prompt()`; otherwise falls back to `GET /api/auth/google?returnUrl=...` → redirects to `accounts.google.com` → `/auth/google/callback` validates state, exchanges code for tokens, calls `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })` → redirects to `returnUrl`.

**Google One Tap auto-prompt:** `<GoogleOneTap>` component in root layout (`src/components/auth/GoogleOneTap.tsx`) — loads GSI script dynamically when user is not logged in and not on an auth page. Generates a nonce (SHA-256 hash passed to Google, raw passed to Supabase). On credential: POST to `/api/auth/google/onetap` → `signInWithIdToken` → `window.location.reload()` (full reload required to pick up server-set session cookies). `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must be set for both features to work.

**Nonce requirement:** Google One Tap always embeds a nonce hash in the ID token. Pass the SHA-256 hash to `google.accounts.id.initialize({ nonce: hashed })` and the raw nonce to `supabase.auth.signInWithIdToken({ nonce: raw })` — mismatch causes 401.

**Client-side auth pattern:** Use `useAuth()` hook (`src/hooks/useAuth.ts`) for component-level auth state — it calls `supabase.auth.getUser()` on mount and subscribes to `onAuthStateChange`. For a one-shot auth check inside a non-component context (e.g. inside `useSavedCharts`), use `supabase.auth.getSession()` (reads cookie instantly, no network). Never use `fetch('/api/auth/me')` for UI — that adds a 2–3s delay. `/api/auth/me` is server-to-server only.

**Other client hooks:**
- `useIdleLogout` — auto-logout after inactivity; mount once in the root layout
- `useVargottama(d1Houses, d9Houses)` — returns Vargottama planet list + insights
- `useDateTimeSync` — syncs date/time picker state across components

### Error Handling

Centralized in `src/lib/api/errorHandling.ts` — use `successResponse()`, `errorResponse()`, `validationError()`, etc. Rate limiting presets in `src/lib/api/rateLimit.ts`: `strict` (5/min), `standard` (20/min), `lenient` (60/min — used for Panchang and horoscope), `auth` (3/5min — very strict). There is no `loose` preset. Rate limiter uses local Redis (`ioredis`, localhost:6379) with an atomic Lua script — shared state across all 4 PM2 cluster workers. Redis singleton lives in `src/lib/redis.ts` and is shared by both the rate limiter and the panchang cache. Fails open if Redis is unavailable.

## Workflow Discipline

- **Complex features** (>2 files, new API + UI, or unclear approach): run `/plan` first, get approval before writing any code
- **Any bug or unexpected behavior**: run `/debug` — diagnose root cause before attempting a fix
- **Any completed task**: run `/verify` — re-read changed files, trace the logic end-to-end, then declare done
- **New pages vs existing pages**: when a feature could live on an existing page or a new page, always ask the user which they prefer — never create a new page without confirming first
- TypeScript errors don't fail the build (`ignoreBuildErrors: true`) — run `npm run type-check` separately after changes

## Conventions

- Path alias: `@/*` maps to `src/*`
- Fonts: Instrument Serif (headings), DM Sans (body) — loaded in root layout
- Theme: CSS variables in `globals.css` with light/dark mode via a **custom `ThemeProvider`** (`src/components/theme-provider.tsx`) — NOT next-themes. Uses `MutationObserver` to re-apply `.dark` class on the `<html>` element whenever React reconciliation strips it. Theme persisted to `localStorage` (key: `theme`) and to `profiles.theme` in Supabase via `/api/user/theme`.
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

### Numerology Module (`src/lib/numerology/`)

Pure client-side calculation — no server calls. All computation runs in the browser.

| File | Responsibility |
|------|---------------|
| `calculate.ts` | Main entry point — `calculateNumerology(dob, name): NumerologyResult` |
| `compatibility.ts` | `calculateCompatibility(r1, r2): CompatibilityResult` — 100-pt score engine |
| `chaldean.ts` | Chaldean name numerology (no letter maps to 9) |
| `meanings.ts` | All pre-written interpretations — `NUMBER_MEANINGS`, `ARROW_MEANINGS`, `RAJ_YOGA_MEANINGS`, `KARMIC_LESSON_MEANINGS`, `MASTER_NUMBER_MEANINGS`, `PLANE_GUIDANCE` |
| `compatibilityMeanings.ts` | LP pair matrix (36 unique pairs) — `getLPPairMeaning(lp1, lp2)` |

**Key calculation rules:**
- Life Path = sum of the **day (DD) digits only**, reduced; master numbers 11/22/33 preserved
- Destiny = sum of **all DOB digits**, reduced; master numbers preserved
- `gridFrequency` = DOB digit frequency + 1 for LP number + 1 for Destiny number → used for grid, planes, arrows, yogas
- `frequency` (DOB only) → used solely for karmic lessons (missing numbers)
- Number strength: 0 = Missing, 1 = Balanced, 2 = Strong, 3+ = Excess

**Compatibility score breakdown (100 pts):** Life Path harmony 30 + Destiny alignment 20 + Grid balance 20 + Arrow harmony 15 + Raj Yoga alignment 15.

**Components:** `src/components/numerology/` — `NumerologyReport` (6-tab reusable report), `CompatibilityReport` (5-tab), `LoShuGrid`, `CoreNumbers`, `ChaldeanCard`, `PlanesAnalysis`, `ArrowsAnalysis`, `RajYogas`, `KarmicLessons`, `SpecialConditions`, `SavedReadings`, `CompatibilityScore`, `GridComparison`, `CompatibilityArrows`, `CompatibilityYogas`.

**`NumerologyReport` is designed to be embedded** — it only takes a `NumerologyResult` prop and is used inside `CompatibilityReport`'s "Full Reports" tab to show each person's complete reading.

**Strings in `meanings.ts` must use double quotes** — single-quoted strings with apostrophes caused a build failure previously.

### Payment Module (`src/lib/payment/`, `src/app/api/payment/`)

PhonePe Standard Checkout integration via `pg-sdk-node` v2.0.3.

| File | Responsibility |
|------|---------------|
| `src/lib/payment/phonepe.ts` | Singleton `StandardCheckoutClient` — call `getPhonePeClient()` from any server-side code |
| `src/app/api/payment/initiate/route.ts` | POST `{ amount: number (₹), name?: string }` → returns `{ merchantOrderId, checkoutUrl, state, expireAt }` |
| `src/app/api/payment/status/route.ts` | GET `?orderId=xxx` → returns order state (`COMPLETED` / `FAILED` / `PENDING`), amount, error codes |
| `src/app/api/payment/webhook/route.ts` | POST — receives PhonePe server-to-server payment notifications; validates via `validateCallback()` |
| `src/app/payment-test/` | Test page at `/payment-test` — not linked from nav, not indexed by search engines |

**Flow:** `POST /api/payment/initiate` → redirect user to `checkoutUrl` → PhonePe redirects back to `/payment-test?orderId=xxx` → `GET /api/payment/status` → show result.

**Amount:** always in ₹ at the API boundary; converted to paisa (×100) internally before passing to SDK.

**Merchant Order ID format:** `TEST_<20-char UUID fragment>` — update the prefix when moving beyond test page.

**Live:** Production credentials configured, account activated, ₹1000 live transaction tested (Apr 2026). Next step: build report selection UI and order flow.

**Future mobile app:** the two API routes are reusable as-is. Mobile frontend will use PhonePe's React Native SDK to trigger native UPI flow, then call `/api/payment/status` to confirm.

### Database Tables (20 in Supabase)
`profiles`, `charts`, `cities`, `reports`, `payments`, `test_cases`, `test_case_runs`, `astronomical_events`, `auth_login_attempts_v2`, `auth_login_events`, `planet_daily_positions`, `planet_retrograde_periods`, `planet_sign_transits`, `transit_generation_log`, `panchang_cache`, `festival_calendar`, `horoscopes`, `horoscope_generation_log`, `numerology_readings`, `compatibility_readings`. Note: `supabase/migrations/001_initial_schema.sql` only defines 4 tables; `supabase/panchang_tables.sql` defines 2 more — the rest were created directly in Supabase.

`charts` table notable column: `yoga_analysis jsonb` (added Apr 2026, populated lazily by `/api/yogas` when a logged-in user opens the Yogas tab; mirrors how `saturnTransits` is cached client-side).

### Yoga & Dosha Module (`src/lib/astrology/yogas/`)

`index.ts` is the single entry point: `analyzeYogas(input) → YogaAnalysisResponse`. Pure-function detectors return uniform `YogaResult` / `DoshaResult` objects.

| File | Responsibility |
|------|---------------|
| `index.ts` | Orchestrator — runs all detectors, applies dedup + display priority, builds response |
| `types.ts` | All shared types: `YogaResult`, `DoshaResult`, `YogaAnalysisResponse`, `LifeArea`, score breakdowns |
| `helpers.ts` | House/lord/aspect/connection helpers — reuses `getLordOfSignPublic`, `getHousesRuled`, `degreeDiff`, `planetAspects` from strength engine (no duplication) |
| `scoring.ts` | Per-spec scoring (yoga 0-100, dosha 0-100), strength + severity labels, category weights |
| `displayPriority.ts` | `selectTopPositive` (default 3), `selectTopChallenging` (default 2). Formula: score + categoryWeight + activationBonus + lifeAreaBonus − fearSensitivityPenalty |
| `displayRules.ts` | Dedup: Dharma-Karmadhipati supersedes Raj 9-10; Durudhura supersedes Sunapha + Anapha |
| `lifeAreas.ts` | Maps each yoga/dosha to 9 life areas; `aggregateLifeAreaImpact` returns net ±100 per area |
| `meanings.ts` | All user-facing copy. Soft language only — never `dangerous`, `fatal`, `destroyed`, `poverty`, `curse`, `doomed`, `divorce`, `death` |
| `empty-states.ts` | `NO_YOGAS_TEXT`, `NO_DOSHAS_TEXT` |
| `detectors/panchaMahapurusha.ts` | Ruchaka, Bhadra, Hamsa, Malavya, Shasha (5) |
| `detectors/moonYogas.ts` | Gaja-Kesari, Sunapha, Anapha, Durudhura, Kemadruma (5) |
| `detectors/conjunctionYogas.ts` | Budhaditya, Guru Chandal (2) |
| `detectors/vipreetRaj.ts` | Harsha, Sarala, Vimala (3) — uses `scoreVipreetHousePlacement` (dusthana = condition, not penalty) |
| `detectors/rajYogas.ts` | Raj 9-10, Kendra-Trikona, Dharma-Karmadhipati, Lakshmi, Amala, Vasumati (6) |
| `detectors/specialYogas.ts` | Neecha Bhanga (uses `checkNeechaBhanga` from strength), Parivartana, Dhana, Shubha Kartari, Paap Kartari (5) |
| `detectors/doshas.ts` | Kaal Sarp, Mangal (Lagna+Moon+Venus refs), Grahan, Angarak, Vish (5) |

**API contract:** Response only includes items where `present && score > 0`. Absent yogas/doshas are NOT returned (no "coming soon" stubs, no zero-score noise). UI consumes `topPositive`, `topChallenging`, `allYogas`, `allDoshas`, `lifeAreas` directly. Schema `version: 2` (bumped Apr 2026 when `chartNarrative` was added to all yogas and doshas). `YogasTab` invalidates any cached `version < 2` and re-fetches.

**Pitra Dosha + Shrapit Dosha**: deferred — not in V1.

**Display tier model (live in production — do not change without approval):**
- Guest (no login): `YogaSummaryCard` + `TopPositiveYogas` (locked) + `ChallengingPatterns` (locked) + "Sign in to see all yogas" button. Clicking any locked card opens `SignInModal` — real content never in DOM for guests.
- Logged-in: `YogaSummaryCard` + `YogaList` (flat list sorted by strength: exceptional → very_strong → strong → moderate → weak, then by score). No intermediate sections.
- Paid report: deferred entirely — no "Upgrade" CTA anywhere.

**YogaCard / DoshaCard design:** 3px left accent border (color = strength/severity), life area chips (up to 3) on collapsed header, two-tab expanded body ("Your Chart" = chart-specific narrative; "About this yoga/dosha" = generic explanation), `Code2` icon button for technical details (`TechnicalDetailsAccordion` with `noWrapper={true}`). All 26 yogas and 5 doshas now have `chartNarrative` — dynamically built inside each detector from actual planet/sign/house data. `DoshaResult` has a `chartNarrative?: string` field; `DoshaCard` prefers it over `technicalReason`.

**Sign-in gating across all chart tabs (Apr 2026):** Every tab gates deeper content behind `SignInModal` with dynamic `title` + `description`:
- Planets tab (`PlanetsTab.tsx`): clicking any planet card when guest → modal
- Sade Sati (`SadeSatiTableView.tsx`): "See full analysis" when guest → modal
- Dasha Timeline (`DashaNavigator.tsx`): Pratyantar + Sookshma rows when guest → modal (Mahadasha + Antardasha free)
- Divisional Charts (`DivisionalChartsTab.tsx`): importance !== 'essential' when guest → modal (Essential charts always free)

**API caller pattern (matches Sadesati):** Lazy fetch on tab open. Body: `{ planets, ascendant, birthDateUtc?, nakshatraLord?, balanceYears?, chartId? }`. The dasha trio is optional — engine sets `dashaUnavailable: true` when missing and skips the dasha factor (max 5 pts).

**Neecha Bhanga scoring:** `dignity` is dynamic — `Math.min(10, 4 + (cancellations.length - 1) * 2)`. Single-rule combust case scores ~51 (moderate), not 70+.

## Known Issues

### Active but non-obvious dependency
- `resend` — used in `scripts/send-audit-email.ts` for admin audit emails, and via direct HTTP in `scripts/transit-db/*.js` for notifications. NOT used in src/ (forgot-password uses `supabase.auth.resetPasswordForEmail()`).

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side admin operations
- `NEXT_PUBLIC_SITE_URL` — App URL for auth callbacks (fallback: https://astrotattwa.com)
- `NEXT_PUBLIC_APP_URL` — App URL for CORS headers in `next.config.js` (fallback: https://astrotattwa.com)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — **No longer used for rate limiting** (switched to local Redis via `ioredis`). Vars kept in `.env.local` for reference but are not loaded into PM2 env.
- `RESEND_API_KEY` — Email service (scripts only, not used in src/)
- `HERE_MAPS_API_KEY` — Location/geocoding for city search (optional)
- `ADMIN_SECRET_TOKEN` — Protects `/api/horoscope/generate` and test endpoints
- `ANTHROPIC_API_KEY` — AI generation for horoscopes
- `APP_INTERNAL_URL` — Internal URL for cron→app HTTP calls (default: `http://localhost:3000`)
- `PHONEPE_CLIENT_ID` — PhonePe merchant client ID
- `PHONEPE_CLIENT_SECRET` — PhonePe merchant client secret
- `PHONEPE_CLIENT_VERSION` — SDK client version (default: `1`)
- `PHONEPE_ENV` — `SANDBOX` or `PRODUCTION` (currently `PRODUCTION`; account active)
- `PHONEPE_WEBHOOK_USERNAME` — set when creating webhook on PhonePe Business dashboard
- `PHONEPE_WEBHOOK_PASSWORD` — set when creating webhook on PhonePe Business dashboard
- `GOOGLE_CLIENT_ID` — Google OAuth 2.0 client ID (server-side, for custom OAuth + One Tap API routes)
- `GOOGLE_CLIENT_SECRET` — Google OAuth 2.0 client secret (server-side, for code exchange in `/auth/google/callback`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Same Google client ID, exposed to the browser for `GoogleOneTap` component and `triggerGoogleOneTap()`
