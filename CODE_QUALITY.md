# Code Quality Report

**Version:** 2.0
**Last Updated:** 2026-05-02
**Audited By:** Automated weekly audit (Claude)
**Next Review:** 2026-05-09 (second Saturday of May)

---

## Purpose

This is a living document. It is re-evaluated every week by the doc audit cron job.
It does not track completed tasks — it reflects the **current state** of the codebase.
Each audit reads the actual source files and rewrites this document from scratch.

---

## Verdict

**No refactoring needed this week.**

The codebase is in good shape after a high-velocity week: Shadbala + Ashtakavarga engine, Yogas & Doshas full UI (26 yogas + 5 doshas), and custom Google OAuth + One Tap all shipped. These features add 14 new components and 6 new API routes but introduce no structural duplication. Dead code list remains stable.

---

## Codebase Baseline

| Metric | Value |
|--------|-------|
| Total TS/TSX files (src/) | 359 |
| Total lines (src/) | ~61,073 |
| Last structural refactor | February 2026 (P1 complete) |
| New files this week | ~20 (strength/, yogas/, googleOneTap.ts, 4 API routes) |

---

## Duplication Hotspots

Areas to watch — not necessarily requiring action, but worth reviewing if they grow.

| Area | Files | Pattern | Severity |
|------|-------|---------|----------|
| Panchang section components | `src/components/panchang/sections/` (14 files) | Similar render structure per section | Low — intentional per-section variation |
| Divisional chart legacy files | `src/lib/utils/divisional/` | Pre-builder files still exist alongside builder | Low — builder supersedes them but old files unused |
| Sadesati calculators | `periodAnalyzer.ts` (1545L), `calculator-PROFESSIONAL.ts` (1183L) | Large files with overlapping Saturn logic | Medium — monitor for further growth |
| Yoga detectors | `src/lib/astrology/yogas/detectors/` (7 files) | Uniform `YogaResult`/`DoshaResult` return shape | Low — intentional, enforced by types |

---

## Dead Code

Components or hooks with zero detected imports across `src/`.

| File | Type | Notes | Action |
|------|------|-------|--------|
| `src/components/horoscope/HistoryNavigator.tsx` | Component | History nav is inline in HoroscopeShell — never imported | Candidate for deletion |
| `src/components/landing/ZodiacWheel.tsx` | Component | Added Apr 2026, not wired to any page | Wire to home hero or delete |
| `src/hooks/useVargottama.ts` | Hook | Vargottama logic unused in UI | Candidate for deletion |
| `src/components/chart/BirthDetails.tsx` | Component | Replaced by UserDetailsCard | Candidate for deletion |
| `src/components/chart/PlanetDisplay.tsx` | Component | Internal dependency of BirthDetails only | Candidate for deletion |
| `src/components/auth/SessionWatcher.tsx` | Component | Only referenced in its own inline comment | Wire to a layout or delete |

> Audit verifies by grepping actual import statements — not inferred from file names.

---

## Bundle Size Signals

Large files that could affect initial load if not lazy-loaded.

| File | Size | Lazy Loaded? | Risk |
|------|------|-------------|------|
| `src/lib/astrology/sadesati/periodAnalyzer.ts` | 1545 lines | Server-only (API route) | None |
| `src/lib/astrology/sadesati/calculator-PROFESSIONAL.ts` | 1183 lines | Server-only (API route) | None |
| `src/lib/astrology/divisionalChartBuilder.ts` | ~400 lines | Server-only | None |
| `src/components/chart/divisional/DivisionalChartsTab.tsx` | Client | Not lazy | Low — only rendered on /chart tab switch |
| `src/components/chart/yogas/YogasTab.tsx` | Client | Not lazy | Low — only rendered on /chart Yogas tab; imports 9 sub-components |
| `src/components/chart/strength/StrengthTab.tsx` | Client | Not lazy | Low — only rendered on /chart Strength tab |

---

## Type Safety

| Check | Status |
|-------|--------|
| Central type file exists (`src/types/astrology.ts`) | Yes |
| `src/types/chart-calculation.ts` for API types | Yes |
| `src/types/horoscope.ts` | Yes |
| `src/types/numerology.ts` | Yes |
| `src/types/sadesati.ts` | Yes |
| Local type re-definitions detected | None found |
| `ignoreBuildErrors: true` in next.config.js | Yes — run `npm run type-check` separately |

---

## Refactoring Opportunities

Items identified but not urgent. Listed here so they are not forgotten.

### 1. Divisional chart legacy files
**Files:** `src/lib/utils/divisional/d2-hora.ts`, `d3-drekkana.ts`, `d7-saptamsa.ts`, `d12-dwadasamsa.ts` and others
**Issue:** The unified `divisionalChartBuilder.ts` was built in Feb 2026. The legacy per-chart files still exist. If they have zero imports, they can be deleted.
**Action:** Grep imports before deleting — builder may coexist intentionally for some charts.
**Priority:** Low

### 2. Sadesati module size
**Files:** `src/lib/astrology/sadesati/periodAnalyzer.ts` (1545L), `calculator-PROFESSIONAL.ts` (1183L)
**Issue:** Very large files. No duplication issue yet, but complexity is high.
**Action:** No action needed now. If a third sadesati file appears, consolidate.
**Priority:** Watch only

### 3. Dead code accumulation
**Files:** See Dead Code table above (6 files/hooks)
**Issue:** BirthDetails, PlanetDisplay, HistoryNavigator, SessionWatcher, ZodiacWheel, useVargottama — all unused. Count has remained stable at 6 for several weeks.
**Action:** Schedule a cleanup sprint to delete confirmed dead files. Wire ZodiacWheel or delete.
**Priority:** Low-Medium

---

## Completed Refactors (historical, do not re-audit)

These were done in Feb 2026 and are stable. The audit does not re-verify these.

| Refactor | Completed | Result |
|----------|-----------|--------|
| Unified divisional chart builder | Feb 10, 2026 | 82% code reduction per chart |
| Centralized type definitions | Feb 10, 2026 | 22 TypeScript errors → 0 |
| Shared form logic + constants | Feb 14, 2026 | EditBirthDetailsForm 541L → 267L |

---

## How to Read This Document

- **Verdict** — top-level weekly call: refactor needed or not
- **Duplication Hotspots** — areas with repeated patterns; severity tells you if action is warranted
- **Dead Code** — zero-import files; candidates for deletion
- **Bundle Size Signals** — large client-side files without lazy loading
- **Refactoring Opportunities** — concrete items with priority; low means watch, medium means plan
