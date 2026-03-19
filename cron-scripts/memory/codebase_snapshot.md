---
name: Codebase Snapshot
description: Weekly automated snapshot of all components, hooks, routes, types, and their usage status
type: project
date: 2026-03-18
---

# Codebase Snapshot — 2026-03-18

## Tech Stack

### Dependencies
- @hookform/resolvers: ^3.3.0
- @radix-ui/react-accordion: ^1.2.12
- @radix-ui/react-collapsible: ^1.1.12
- @radix-ui/react-label: ^2.1.8
- @radix-ui/react-popover: ^1.1.15
- @radix-ui/react-progress: ^1.1.8
- @radix-ui/react-scroll-area: ^1.2.10
- @radix-ui/react-select: ^2.2.6
- @radix-ui/react-slot: ^1.0.2
- @radix-ui/react-toast: ^1.1.5
- @sentry/nextjs: ^10.38.0
- @supabase/ssr: ^0.9.0-rc.2
- @supabase/supabase-js: ^2.97.0
- @tanstack/react-query: ^5.17.0
- class-variance-authority: ^0.7.1
- clsx: ^2.1.1
- date-fns: ^3.2.0
- framer-motion: ^11.18.2
- geo-tz: ^8.1.5
- lucide-react: ^0.312.0
- next: ^16.1.6
- next-themes: ^0.2.1
- react: ^18.3.1
- react-day-picker: ^9.13.0
- react-dom: ^18.3.1
- react-hook-form: ^7.49.0
- react-swipeable: ^7.0.2
- resend: ^6.9.4
- swisseph: ^0.5.17
- tailwind-merge: ^2.6.1
- tailwindcss-animate: ^1.0.7
- zod: ^3.22.0
- zustand: ^4.5.0

### DevDependencies
- @next/bundle-analyzer: ^16.1.6
- @storybook/nextjs: ^10.2.8
- @testing-library/react: ^16.3.2
- @types/luxon: ^3.7.1
- @types/node: ^20.11.0
- @types/react: ^18.3.27
- @types/react-dom: ^18.3.7
- @typescript-eslint/eslint-plugin: ^8.55.0
- autoprefixer: ^10.4.17
- eslint: ^8.56.0
- eslint-config-next: ^14.1.0
- eslint-plugin-security: ^3.0.1
- postcss: ^8.4.33
- prettier: ^3.2.0
- prettier-plugin-tailwindcss: ^0.5.0
- tailwindcss: ^3.4.0
- typescript: ^5.3.0
- vitest: ^4.0.18

## Directory Structure
```
app/
components/
hooks/
lib/
styles/
types/
```

## Components (Active)
- toast — src/components/ui/toast.tsx — 4 imports
- button — src/components/ui/button.tsx — 13 imports
- toaster — src/components/ui/toaster.tsx — 1 import
- theme-provider — src/components/theme-provider.tsx — 1 import
- label — src/components/ui/label.tsx — 10 imports
- BirthDetails — src/components/chart/BirthDetails.tsx — 1 import
- StatusBadges — src/components/chart/StatusBadges.tsx — 1 import
- PlanetaryTable — src/components/chart/PlanetaryTable.tsx — 1 import
- badge — src/components/ui/badge.tsx — 5 imports
- card — src/components/ui/card.tsx — 8 imports
- progress — src/components/ui/progress.tsx — 2 imports
- popover — src/components/ui/popover.tsx — 2 imports
- select — src/components/ui/select.tsx — 1 import
- calendar — src/components/ui/calendar.tsx — 1 import
- DiamondGrid — src/components/chart/diamond/DiamondGrid.tsx — 1 import
- accordion — src/components/ui/accordion.tsx — 1 import
- scroll-area — src/components/ui/scroll-area.tsx — 1 import
- collapsible — src/components/ui/collapsible.tsx — 1 import
- alert — src/components/ui/alert.tsx — 1 import
- ChartLegend — src/components/chart/ChartLegend.tsx — 1 import
- ChartFocusMode — src/components/chart/ChartFocusMode.tsx — 2 imports
- ChartInsights — src/components/chart/divisional/ChartInsights.tsx — 3 imports
- CitySearch — src/components/forms/CitySearch.tsx — 2 imports
- input — src/components/ui/input.tsx — 9 imports
- Particles — src/components/landing/Particles.tsx — 1 import
- Glyphs — src/components/landing/Glyphs.tsx — 1 import
- Yantra — src/components/landing/Yantra.tsx — 1 import
- ChartLoader — src/components/ui/ChartLoader.tsx — 1 import
- NavagrahaSection — src/components/landing/NavagrahaSection.tsx — 1 import
- Logo — src/components/ui/Logo.tsx — 12 imports
- SessionWatcher — src/components/auth/SessionWatcher.tsx — 1 import
- Header — src/components/layout/Header.tsx — 9 imports
- DateTimeField — src/components/forms/DateTimeField.tsx — 4 imports
- DiamondChart — src/components/chart/diamond/DiamondChart.tsx — 2 imports
- PlanetDisplay — src/components/chart/PlanetDisplay.tsx — 3 imports
- AvakhadaTable — src/components/chart/AvakhadaTable.tsx — 1 import
- ChartEducation — src/components/chart/divisional/ChartEducation.tsx — 1 import
- DivisionalChartsTab — src/components/chart/divisional/DivisionalChartsTab.tsx — 1 import
- ChartSelector — src/components/chart/divisional/ChartSelector.tsx — 1 import
- Footer — src/components/layout/Footer.tsx — 5 imports
- BirthDataFormWrapper — src/components/forms/BirthDataFormWrapper.tsx — 2 imports
- EditBirthDetailsForm — src/components/forms/EditBirthDetailsForm.tsx — 1 import
- BirthDataForm — src/components/forms/BirthDataForm.tsx — 3 imports
- DashaNavigator — src/components/chart/DashaNavigator.tsx — 1 import
- shared — src/components/chart/sadesati/shared.tsx — 1 import
- PeriodDetailView — src/components/chart/sadesati/PeriodDetailView.tsx — 1 import
- SadeSatiTableView — src/components/chart/sadesati/SadeSatiTableView.tsx — 1 import
- UserDetailsCard — src/components/chart/UserDetailsCard.tsx — 1 import

## Components (Dead Code)
- AscendantCard — src/components/chart/AscendantCard.tsx — 0 imports
- HouseBlock — src/components/chart/HouseBlock.tsx — 0 imports
- DashaTimeline — src/components/chart/DashaTimeline.tsx — 0 imports
- NorthIndianChart — src/components/chart/NorthIndianChart.tsx — 0 imports

## Hooks (Active)
- use-toast — src/hooks/use-toast.ts — 1 import
- useAuth — src/hooks/useAuth.ts — 1 import
- useIdleLogout — src/hooks/useIdleLogout.ts — 2 imports
- useDateTimeSync — src/hooks/useDateTimeSync.ts — 2 imports
- useSavedCharts — src/hooks/useSavedCharts.ts — 1 import

## Hooks (Unused)
- useVargottama — src/hooks/useVargottama.ts — 0 imports

## API Routes
- /api/avakahada — src/app/api/avakahada/route.ts — HTTP methods: GET
- /api/dasha/antardasha — src/app/api/dasha/antardasha/route.ts — HTTP methods: GET
- /api/dasha/current — src/app/api/dasha/current/route.ts — HTTP methods: GET
- /api/dasha/pratyantar — src/app/api/dasha/pratyantar/route.ts — HTTP methods: GET
- /api/dasha/sookshma — src/app/api/dasha/sookshma/route.ts — HTTP methods: GET
- /api/test/delete-runs — src/app/api/test/delete-runs/route.ts — HTTP methods: DELETE
- /api/test/history — src/app/api/test/history/route.ts — HTTP methods: GET
- /api/test/run-calculations — src/app/api/test/run-calculations/route.ts — HTTP methods: GET
- /api/cities/search — src/app/api/cities/search/route.ts — HTTP methods: GET
- /api/auth/logout — src/app/api/auth/logout/route.ts — HTTP methods: POST
- /api/auth/login — src/app/api/auth/login/route.ts — HTTP methods: POST
- /api/auth/me — src/app/api/auth/me/route.ts — HTTP methods: GET
- /api/SaveChart/[id] — src/app/api/SaveChart/[id]/route.ts — HTTP methods: PATCH, DELETE
- /api/SaveChart — src/app/api/SaveChart/route.ts — HTTP methods: GET, POST
- /api/calculate — src/app/api/calculate/route.ts — HTTP methods: GET
- /api/dasha/mahadashas — src/app/api/dasha/mahadashas/route.ts — HTTP methods: GET
- /api/transits/saturn/sadesati — src/app/api/transits/saturn/sadesati/route.ts — HTTP methods: POST
- /api/transits/saturn/period-analysis — src/app/api/transits/saturn/period-analysis/route.ts — HTTP methods: POST

## Types
- src/types/supabase.ts
- src/types/chart-calculation.ts
- src/types/index.ts
- src/types/astrology.ts
- src/types/sadesati.ts

## Git Activity (past 7 days)
Recent commits (most recent first):
- ee2e6e8 Update audit email with server commands for approve/reject
- f4c6b83 Add automated doc audit pipeline + update COMPONENT_LIBRARY v2.0
- 20655e6 Update period-analysis-types.ts
- a58aa2b Update periodAnalyzer.ts
- d6ecfde Update PeriodDetailView.tsx
- 14ee1c2 Update SadeSatiTableView.tsx (multiple iterations)
- afe2695 Update ChartClient.tsx (multiple iterations)
- 406ac1f Update UserDetailsCard.tsx
- 005c70f Create PeriodDetailView.tsx
- cd9a2cb Create shared.tsx
- b872aea Create route.ts (period-analysis)
- 432db94 Create period-analysis-types.ts
- 90c5b89 Update saturnTransitDB.ts
- 3f13c1b Create period-analysis-types.ts
- 4285a23 Update calculator-PROFESSIONAL.ts
- b6b3f9a Update route.ts (sadesati)
- 1c84d10 Sync updates from astrotattwa-web-dev

**Key changes this week:**
- New Saturn transit period-analysis feature: new route, PeriodDetailView component, periodAnalyzer.ts logic, saturnTransitDB.ts
- SadeSatiTableView heavily iterated (7+ commits)
- ChartClient.tsx updated multiple times
- Automated doc audit pipeline added (cron-based)
- UserDetailsCard updated

## Summary
- Total components: 51 (active: 47, dead: 4)
- Total hooks: 6 (active: 5, unused: 1)
- Total API routes: 18
- Files changed this week: ~17 unique files across ~31 commits
- Snapshot generated: 2026-03-18T00:00:00Z
