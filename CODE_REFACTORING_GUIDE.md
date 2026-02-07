# Code Refactoring Guide

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** P1 Priority Task

---

## 📋 Table of Contents

- [Overview](#overview)
- [Audit Findings](#audit-findings)
- [Refactoring Priorities](#refactoring-priorities)
- [Common Patterns](#common-patterns)
- [Component Consolidation](#component-consolidation)
- [Performance Optimizations](#performance-optimizations)
- [Code Quality](#code-quality)
- [Implementation Plan](#implementation-plan)

---

## 🎯 Overview

This guide documents code refactoring opportunities identified in the Astrotattwa codebase (~6,222 lines across 71 TypeScript files). The goal is to reduce redundancy, improve maintainability, and optimize bundle size while maintaining 100% functionality.

### Objectives
- ✅ Reduce code duplication by 50%+
- ✅ Decrease bundle size by 20%+
- ✅ Improve component reusability
- ✅ Enhance type safety
- ✅ Maintain Lighthouse 100/100 score

---

## 🔍 Audit Findings

### Current State
- **Total Files:** 71 (TypeScript/TSX)
- **Components:** ~45
- **Utilities:** ~15
- **API Routes:** ~10
- **Estimated Duplication:** 15-20%

### Areas of Concern

#### 1. **Duplicate Chart Building Logic**
**Location:** `/src/lib/utils/`
- `chartHelpers.ts` - Base chart building
- `divisional/d2-hora.ts` - Hora calculations
- `divisional/d3-drekkana.ts` - Drekkana calculations
- `divisional/d7-saptamsa.ts` - Saptamsa calculations
- `divisional/d12-dwadasamsa.ts` - Dwadasamsa calculations

**Issue:** Each divisional chart file has ~70% duplicate code for:
- Sign calculation
- House assignment logic
- Planet distribution
- Rashi number mapping

**Impact:** ~400 lines of duplicate code

#### 2. **Redundant Type Definitions**
**Location:** Multiple files
- `src/app/chart/page.tsx` - Defines types locally
- `src/types/` - Should be centralized here
- API route files - Re-define same interfaces

**Issue:** `PlanetData`, `AscendantData`, `HouseData` defined in 5+ places

**Impact:** Type inconsistencies, maintenance burden

#### 3. **Form Component Similarities**
**Location:** `/src/components/forms/`
- `BirthDataForm.tsx` - Main form
- `EditBirthDetailsForm.tsx` - Edit form

**Issue:** 60% duplicate validation, field logic, and styling

**Impact:** ~150 lines of duplicate code

#### 4. **Chart Display Components**
**Location:** `/src/components/chart/`
- Multiple components with similar loading states
- Duplicate error handling patterns
- Repeated prop validation

**Issue:** Could be extracted into HOCs or hooks

**Impact:** ~200 lines of duplicate code

#### 5. **API Route Patterns**
**Location:** `/src/app/api/`
- Similar error handling in each route
- Duplicate CORS logic
- Repeated validation patterns

**Issue:** No centralized middleware

**Impact:** ~100 lines of duplicate code

---

## 🎯 Refactoring Priorities

### Priority 1: Critical (Week 1)
**Must fix - blocks future development**

#### 1.1 Consolidate Divisional Chart Calculations
**Effort:** 2-3 days  
**Impact:** High

**Current:**
```typescript
// d2-hora.ts
export function buildHoraHouses(planets, ascendant) {
  // 70 lines of logic
}

// d3-drekkana.ts
export function buildDrekkanaHouses(planets, ascendant) {
  // 70 lines of SIMILAR logic
}
```

**Proposed:**
```typescript
// divisionalChartBuilder.ts
export function buildDivisionalHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData,
  division: DivisionConfig
): HouseData[] {
  // Shared logic (40 lines)
  const houses = initializeHouses(ascendant, division.type);
  
  for (const [key, planet] of Object.entries(planets)) {
    const divisionalSign = calculateDivisionalSign(
      planet.longitude,
      division.divisor,
      division.startingPoint
    );
    assignPlanetToHouse(houses, key, planet, divisionalSign);
  }
  
  return houses;
}

// Usage
buildDivisionalHouses(planets, ascendant, HORA_CONFIG);
buildDivisionalHouses(planets, ascendant, DREKKANA_CONFIG);
```

**Files to Create:**
- `src/lib/utils/divisional/divisionalChartBuilder.ts` (new)
- `src/lib/utils/divisional/divisionConfigs.ts` (new)

**Files to Refactor:**
- `d2-hora.ts`, `d3-drekkana.ts`, `d7-saptamsa.ts`, `d12-dwadasamsa.ts`

**Savings:** ~300 lines of code

---

#### 1.2 Centralize Type Definitions
**Effort:** 1 day  
**Impact:** High

**Current:** Types scattered across files

**Proposed Structure:**
```typescript
// src/types/astrology.ts (NEW)
export interface PlanetData {
  longitude: number;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  retrograde: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  nakshatra?: NakshatraData;
}

export interface AscendantData {
  sign: string;
  signNumber: number;
  degreeInSign: number;
}

export interface HouseData {
  houseNumber: number;
  rasiNumber: number;
  planets: PlanetInHouse[];
}

// ... all astrology types
```

**Files to Create:**
- `src/types/astrology.ts`
- `src/types/api.ts`
- `src/types/forms.ts`

**Files to Refactor:**
- Remove local type definitions from 10+ files
- Import from centralized types

**Savings:** ~200 lines of duplicate types

---

#### 1.3 Extract Common Form Logic
**Effort:** 1-2 days  
**Impact:** Medium

**Current:** Duplicate validation and field logic

**Proposed:**
```typescript
// src/hooks/useBirthDataForm.ts (NEW)
export function useBirthDataForm(
  initialData?: ChartFormData,
  onSubmit?: (data: ChartFormData) => void
) {
  const form = useForm<ChartFormData>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: initialData || DEFAULT_VALUES
  });
  
  // Shared validation logic
  const validateDateTime = useCallback(...);
  const validateLocation = useCallback(...);
  
  return { form, validateDateTime, validateLocation };
}

// Usage in both BirthDataForm and EditBirthDetailsForm
const { form, validateDateTime } = useBirthDataForm(initialData, onSubmit);
```

**Files to Create:**
- `src/hooks/useBirthDataForm.ts`
- `src/lib/validation/chartFormValidation.ts`

**Files to Refactor:**
- `BirthDataForm.tsx`
- `EditBirthDetailsForm.tsx`

**Savings:** ~150 lines of code

---

### Priority 2: High (Week 2)
**Important - improves maintainability**

#### 2.1 Create Chart Component HOC
**Effort:** 1 day  
**Impact:** Medium

**Proposed:**
```typescript
// src/components/chart/withChartWrapper.tsx (NEW)
export function withChartWrapper<T>(
  ChartComponent: React.ComponentType<T>,
  options?: ChartWrapperOptions
) {
  return function WrappedChart(props: T) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Shared loading/error UI
    if (loading) return <ChartSkeleton />;
    if (error) return <ChartError message={error} />;
    
    return <ChartComponent {...props} />;
  };
}

// Usage
export const DiamondChart = withChartWrapper(DiamondChartBase);
export const PlanetaryTable = withChartWrapper(PlanetaryTableBase);
```

**Savings:** ~100 lines of repeated loading/error states

---

#### 2.2 Consolidate API Middleware
**Effort:** 1-2 days  
**Impact:** High

**Proposed:**
```typescript
// src/lib/api/middleware.ts (NEW)
export const withErrorHandling = (handler: ApiHandler) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  };
};

export const withCORS = (handler: ApiHandler) => {
  return async (req: NextRequest) => {
    const response = await handler(req);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  };
};

// Composable middleware
export const withAPI = compose(
  withErrorHandling,
  withCORS,
  withRateLimit
);

// Usage
export const POST = withAPI(async (req) => {
  // Handler logic
});
```

**Savings:** ~100 lines across 10+ API routes

---

### Priority 3: Medium (Week 3-4)
**Nice to have - optimization**

#### 3.1 Lazy Load Heavy Components
**Effort:** 1 day  
**Impact:** Medium

**Current:** All components loaded upfront

**Proposed:**
```typescript
// Lazy load divisional charts
const DivisionalChartsTab = lazy(() => 
  import('@/components/chart/divisional/DivisionalChartsTab')
);

// Lazy load chart focus mode
const ChartFocusMode = lazy(() => 
  import('@/components/chart/ChartFocusMode')
);
```

**Impact:** Reduce initial bundle by ~50 KB

---

#### 3.2 Optimize Re-renders
**Effort:** 2 days  
**Impact:** Medium

**Proposed:**
```typescript
// Memoize expensive calculations
const houses = useMemo(
  () => buildLagnaHouses(planets, ascendant),
  [planets, ascendant]
);

// Memoize callbacks
const handlePlanetClick = useCallback(
  (planetKey: string) => {
    // Handle click
  },
  [dependencies]
);

// Use React.memo for pure components
export const PlanetDisplay = React.memo(PlanetDisplayBase);
```

**Impact:** Reduce unnecessary re-renders by 30%+

---

## 🧩 Common Patterns to Extract

### 1. **Loading States Pattern**
```typescript
// src/components/common/LoadingState.tsx (NEW)
export const LoadingState = ({ type }: { type: 'chart' | 'table' | 'page' }) => {
  return <>{/* Appropriate skeleton */}</>;
};
```

### 2. **Error Boundary Pattern**
```typescript
// src/components/common/ErrorBoundary.tsx (NEW)
export class ChartErrorBoundary extends React.Component {
  // Error handling for chart components
}
```

### 3. **Data Fetching Pattern**
```typescript
// src/hooks/useChartData.ts (NEW)
export function useChartData(chartId?: string) {
  const { data, loading, error } = useQuery(...);
  return { chart: data, loading, error };
}
```

---

## 📦 Bundle Optimization

### Current Bundle Analysis
```bash
npm run build

# Expected output (estimate):
Page                                       Size     First Load JS
┌ ○ /                                     15 kB          120 kB
├ ○ /chart                                25 kB          350 kB  ⚠️
└ ○ /api/*                                varies

First Load JS shared by all               105 kB
  ├ chunks/framework-*.js                 45 kB
  ├ chunks/main-*.js                      32 kB
  ├ chunks/pages/_app-*.js                28 kB
```

### Optimization Targets
1. **Code Splitting**
   - Lazy load `/chart` route components
   - Dynamic imports for divisional charts
   - Target: < 200 KB first load for `/chart`

2. **Tree Shaking**
   - Remove unused lodash functions
   - Use specific imports instead of `import *`
   - Target: -20 KB

3. **Dependency Audit**
   ```bash
   npx depcheck  # Find unused dependencies
   npm prune     # Remove them
   ```

---

## ✅ Implementation Plan

### Week 1: Critical Refactoring
- **Day 1-2:** Consolidate divisional chart calculations
- **Day 3:** Centralize type definitions
- **Day 4-5:** Extract common form logic

### Week 2: High Priority
- **Day 1:** Create chart HOC
- **Day 2-3:** API middleware consolidation
- **Day 4-5:** Testing and documentation

### Week 3: Optimization
- **Day 1:** Lazy loading implementation
- **Day 2-3:** Re-render optimization
- **Day 4-5:** Bundle analysis and final tweaks

---

## 📊 Success Metrics

### Code Quality
- [ ] Duplication < 5% (from ~15%)
- [ ] All types centralized
- [ ] No eslint warnings
- [ ] 100% TypeScript strict mode

### Performance
- [ ] Bundle size < 300 KB (from ~350 KB)
- [ ] Lighthouse 100/100 maintained
- [ ] FCP < 0.5s
- [ ] Re-renders reduced 30%+

### Maintainability
- [ ] All patterns documented
- [ ] Reusable hooks created
- [ ] Component library established
- [ ] AI assistants can navigate codebase

---

## 🔄 Before/After Comparison

### Before Refactoring
```
Total Lines: 6,222
Duplication: ~15% (933 lines)
Bundle Size: 350 KB
Components: 45 (many similar)
Type Definitions: Scattered
```

### After Refactoring (Target)
```
Total Lines: 5,200 (-16%)
Duplication: ~5% (260 lines)
Bundle Size: 280 KB (-20%)
Components: 40 (highly reusable)
Type Definitions: Centralized
```

---

## 📝 Checklist

### Pre-Refactoring
- [ ] Run full test suite (if exists)
- [ ] Create git branch: `refactor/code-optimization`
- [ ] Backup current codebase
- [ ] Document current bundle size

### During Refactoring
- [ ] Make incremental commits
- [ ] Test after each change
- [ ] Update types
- [ ] Maintain functionality

### Post-Refactoring
- [ ] Run bundle analyzer
- [ ] Lighthouse audit
- [ ] Update documentation
- [ ] Create PR for review

---

## 🚨 Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation:** Incremental refactoring, thorough testing

### Risk 2: Regression Bugs
**Mitigation:** Test each divisional chart after changes

### Risk 3: Bundle Size Increase
**Mitigation:** Monitor bundle size after each change

---

## 📚 References

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Next.js Bundle Analysis](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Last Updated:** February 7, 2026  
**Next Review:** February 14, 2026  
**Owner:** Aakash + AI Assistants (Claude/ChatGPT)
