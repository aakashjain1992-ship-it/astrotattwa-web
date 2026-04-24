# Code Quality Report

**Version:** 1.0  
**Last Updated:** 2026-04-24  
**Audited By:** Automated weekly audit (Claude)  
**Next Review:** 2026-05-02 (first Saturday of May)

---

## Purpose

This is a living document. It is re-evaluated every week by the doc audit cron job.  
It does not track completed tasks — it reflects the **current state** of the codebase.  
Each audit reads the actual source files and rewrites this document from scratch.

---

## Verdict

**No refactoring needed this week.**

Codebase is in good shape. The major structural refactors from Feb 2026 (unified divisional chart builder, centralized types, shared form logic) are holding well. No new duplication hotspots detected.

---

## Codebase Baseline

| Metric | Value |
|--------|-------|
| Total TS/TSX files | 293 |
| Total lines (src/) | ~20,931 |
| Last structural refactor | February 2026 (P1 complete) |

---

## Duplication Hotspots

Areas to watch — not necessarily requiring action, but worth reviewing if they grow.

| Area | Files | Pattern | Severity |
|------|-------|---------|----------|
| Panchang section components | `src/components/panchang/sections/` (14 files) | Similar render structure per section | Low — intentional per-section variation |
| Divisional chart legacy files | `src/lib/utils/divisional/` | Pre-builder files still exist alongside builder | Low — builder supersedes them but old files unused |
| Sadesati calculators | `periodAnalyzer.ts` (1545L), `calculator-PROFESSIONAL.ts` (1183L) | Large files with overlapping Saturn logic | Medium — monitor for further growth |

---

## Dead Code

Components or hooks with zero detected imports across `src/`.

| File | Type | Last Changed | Action |
|------|------|-------------|--------|
| *(none detected)* | — | — | — |

> Audit verifies by grepping actual imports — not inferred from file names.

---

## Bundle Size Signals

Large files that could affect initial load if not lazy-loaded.

| File | Size | Lazy Loaded? | Risk |
|------|------|-------------|------|
| `src/lib/astrology/sadesati/periodAnalyzer.ts` | 1545 lines | Server-only (API route) | None |
| `src/lib/astrology/sadesati/calculator-PROFESSIONAL.ts` | 1183 lines | Server-only (API route) | None |
| `src/lib/astrology/divisionalChartBuilder.ts` | ~400 lines | Server-only | None |
| `src/components/chart/divisional/DivisionalChartsTab.tsx` | Client | Not lazy | Low — loaded on /chart tab switch only |

---

## Type Safety

| Check | Status |
|-------|--------|
| Central type file exists (`src/types/astrology.ts`) | Yes |
| `src/types/chart-calculation.ts` for API types | Yes |
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
