# AI Handoff Guide - Claude & ChatGPT Collaboration

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Purpose:** Enable seamless collaboration between AI assistants

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Reference](#quick-reference)
- [Project Context](#project-context)
- [Communication Protocol](#communication-protocol)
- [Task Handoff Process](#task-handoff-process)
- [Code Standards](#code-standards)
- [Common Pitfalls](#common-pitfalls)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This guide ensures smooth collaboration between Claude and ChatGPT when working on the Astrotattwa project. Both AIs should follow these guidelines to maintain consistency and avoid conflicts.

### Why This Guide Exists
- **Solo Developer:** Aakash uses both Claude and ChatGPT
- **Context Switching:** Different AIs need to understand each other's work
- **Consistency:** Maintain code quality across sessions
- **Efficiency:** Avoid duplicate work or conflicting approaches

---

## ⚡ Quick Reference

### When Starting a Session

1. **Read These Files First:**
   ```
   README.md                    # Project overview
   DEVELOPMENT_ROADMAP.md       # Current priorities
   PROGRESS_TRACKER.md          # What's done/in-progress
   ```

2. **Check Current State:**
   ```bash
   # On Linode server
   cd /var/www/astrotattwa-web
   git status
   git log -5  # Last 5 commits
   ```

3. **Ask Aakash:**
   - "What were you working on last?"
   - "Any blockers or issues?"
   - "Which priority should I focus on?"

---

## 📚 Project Context

### Project Structure
```
Astrotattwa - Vedic Astrology Web App
├── Live: https://astrotattwa.com
├── Server: Linode (172.236.176.107)
├── Path: /var/www/astrotattwa-web
├── Process: PM2 (astrotattwa-web)
└── Stack: Next.js 14, TypeScript, Supabase, Swiss Ephemeris
```

### Current Phase
**Phase 2: Code Quality & Foundation (0%)**
- P1: Code Optimization & Refactoring
- P2: Component Library Documentation
- P3: API Authentication & Security
- P4: Database Migration Planning

See `DEVELOPMENT_ROADMAP.md` for complete roadmap.

---

## 💬 Communication Protocol

### Handoff Format

When completing a session, document:

#### 1. **Session Summary**
```markdown
## Session Summary - [Date]

**AI Assistant:** Claude/ChatGPT  
**Duration:** [time]  
**Focus Area:** [P1/P2/P3 task]

### What I Did:
- [x] Task 1 completed
- [x] Task 2 completed
- [ ] Task 3 in progress (50% done)

### Files Modified:
- `src/lib/utils/divisional/index.ts` - Consolidated calculations
- `src/types/astrology.ts` - Centralized types
- `README.md` - Updated documentation

### Next Steps:
- [ ] Complete Task 3 (2 hours remaining)
- [ ] Test divisional chart calculations
- [ ] Update PROGRESS_TRACKER.md

### Blockers/Notes:
- Waiting for Aakash to confirm database migration decision
- Found potential bug in D9 calculation (needs review)
```

#### 2. **Update Progress Tracker**
Always update `PROGRESS_TRACKER.md` with checkbox status:
```markdown
- [x] Consolidate divisional chart calculations (DONE)
- [x] Create divisionalChartBuilder.ts (DONE)
- [ ] Centralize type definitions (IN PROGRESS - 50%)
```

#### 3. **Git Commits**
Use clear commit messages:
```bash
git commit -m "refactor(divisional): consolidate chart calculations

- Created divisionalChartBuilder.ts
- Reduced duplication by 300 lines
- All D2, D3, D7, D12 charts now use shared logic
- Tests passing

Closes #12"
```

---

## 🔄 Task Handoff Process

### Scenario 1: Claude → ChatGPT

**Claude's Last Action:**
```markdown
I was refactoring divisional charts. Created `divisionalChartBuilder.ts`
but didn't finish updating all chart files yet.

Files to update:
- [ ] d2-hora.ts
- [ ] d3-drekkana.ts
- [x] d7-saptamsa.ts (DONE)
- [ ] d12-dwadasamsa.ts

Pattern to follow is in d7-saptamsa.ts (already refactored).
```

**ChatGPT's First Action:**
1. Read the session summary
2. Review `d7-saptamsa.ts` to understand pattern
3. Continue with remaining files
4. Test all charts after completion

---

### Scenario 2: ChatGPT → Claude

**ChatGPT's Last Action:**
```markdown
Added authentication middleware to API routes.

Completed:
- [x] Created /src/lib/api/middleware.ts
- [x] Updated /api/calculate route
- [x] Updated /api/dasha/* routes

Still needed:
- [ ] Update /api/chart/* routes (CRUD)
- [ ] Add rate limiting
- [ ] Test with Postman

Authentication flow is in middleware.ts, follow that pattern.
```

**Claude's First Action:**
1. Read session summary
2. Review `middleware.ts` implementation
3. Apply same pattern to remaining routes
4. Add rate limiting (use `express-rate-limit` pattern)
5. Test with Postman or curl

---

## 💻 Code Standards

### TypeScript Rules

```typescript
// ✅ GOOD - Explicit types
interface ChartData {
  planets: Record<string, PlanetData>;
  houses: HouseData[];
}

export function buildChart(data: ChartFormData): ChartData {
  // Implementation
}

// ❌ BAD - Implicit any
export function buildChart(data) {
  // No types
}
```

---

### Component Patterns

```tsx
// ✅ GOOD - Server Component (default)
// app/chart/page.tsx
export default async function ChartPage() {
  const data = await fetchData();
  return <ChartDisplay data={data} />;
}

// ✅ GOOD - Client Component (when needed)
// components/chart/InteractiveChart.tsx
'use client';

import { useState } from 'react';

export const InteractiveChart = () => {
  const [selected, setSelected] = useState(null);
  // Interactive logic
};

// ❌ BAD - Unnecessary 'use client'
'use client';  // Not needed if no hooks/interactivity
export const StaticChart = ({ data }) => {
  return <div>{data}</div>;
};
```

---

### File Naming

```
✅ GOOD:
- DiamondChart.tsx (PascalCase components)
- chartHelpers.ts (camelCase utilities)
- astrology.ts (camelCase types)

❌ BAD:
- diamondChart.tsx (wrong case)
- ChartHelpers.ts (utilities should be camelCase)
- Astrology.ts (types should be camelCase)
```

---

### Import Order

```typescript
// ✅ GOOD - Organized imports
// 1. React/Next
import { useState } from 'react';
import Image from 'next/image';

// 2. External libraries
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 3. Internal utilities
import { buildLagnaHouses } from '@/lib/utils/chartHelpers';
import { calculateSubLord } from '@/lib/astrology/kp/calculate';

// 4. Components
import { Button } from '@/components/ui/button';
import { DiamondChart } from '@/components/chart/diamond/DiamondChart';

// 5. Types
import type { ChartData, PlanetData } from '@/types/astrology';

// ❌ BAD - Random order
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { ChartData } from '@/types/astrology';
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: Not Checking Current State
❌ **Wrong:** Start coding without checking git history  
✅ **Right:** Always check `git log` and `PROGRESS_TRACKER.md`

### Pitfall 2: Overwriting In-Progress Work
❌ **Wrong:** Modify files without checking if another AI is working on them  
✅ **Right:** Check session summary for "IN PROGRESS" markers

### Pitfall 3: Inconsistent Patterns
❌ **Wrong:** Create new pattern for same problem  
✅ **Right:** Follow existing patterns (see `COMPONENT_LIBRARY.md`)

### Pitfall 4: Missing Documentation Updates
❌ **Wrong:** Code changes without updating docs  
✅ **Right:** Always update relevant documentation

### Pitfall 5: Unclear Commit Messages
❌ **Wrong:** `git commit -m "fix stuff"`  
✅ **Right:** `git commit -m "fix(dasha): correct balance calculation for Moon dasha"`

---

## ✅ Best Practices

### 1. **Read Before Writing**

**Always check these files first:**
```bash
# Project state
cat README.md | head -50
cat DEVELOPMENT_ROADMAP.md | grep "Phase 2" -A 20
cat PROGRESS_TRACKER.md | grep "\[ \]"  # Pending tasks

# Recent changes
git log --oneline -10
git diff HEAD~1
```

---

### 2. **Document Everything**

**Create session notes:**
```markdown
## Session Notes - Feb 7, 2026 (Claude)

**Task:** P1 - Code Refactoring

**Completed:**
- Consolidated divisional chart logic
- Created divisionalChartBuilder.ts
- Reduced duplication by 300 lines

**In Progress:**
- Updating d12-dwadasamsa.ts (80% done)

**Next:**
- Finish d12 update
- Test all divisional charts
- Update tests
```

---

### 3. **Small, Focused Commits**

```bash
# ✅ GOOD - Small, focused
git commit -m "refactor(divisional): create shared builder function"
git commit -m "refactor(divisional): update d2-hora to use shared builder"
git commit -m "refactor(divisional): update d3-drekkana to use shared builder"

# ❌ BAD - Large, unclear
git commit -m "refactoring"
```

---

### 4. **Test After Changes**

**Always verify:**
```bash
# Type check
npm run type-check

# Build
npm run build

# Manual test
npm run dev
# Then test in browser
```

---

### 5. **Communicate Blockers**

If stuck, document clearly:
```markdown
## BLOCKER

**Issue:** Can't proceed with database migration without decision

**Question for Aakash:**
Should we:
- Option A: Keep Supabase
- Option B: Migrate to Linode PostgreSQL

**Impact:** Blocks P3 (API Authentication) which depends on database choice

**Next AI:** Skip this task, move to P2 (Component Documentation)
```

---

## 🔧 Common Tasks

### Task: Adding New Component

1. **Create file:**
   ```bash
   touch src/components/chart/NewChart.tsx
   ```

2. **Follow pattern:**
   ```tsx
   // Use similar component as template
   // e.g., DiamondChart.tsx
   ```

3. **Document:**
   - Add to `COMPONENT_LIBRARY.md`
   - Include props, usage example

4. **Test:**
   - Import and use in test page
   - Verify mobile responsive

5. **Commit:**
   ```bash
   git add .
   git commit -m "feat(chart): add NewChart component

   - Created NewChart.tsx
   - Added to component library docs
   - Tested on mobile and desktop"
   ```

---

### Task: Refactoring Code

1. **Identify pattern:**
   - Read `CODE_REFACTORING_GUIDE.md`
   - Find priority item

2. **Create branch:**
   ```bash
   git checkout -b refactor/specific-task
   ```

3. **Make changes incrementally:**
   - One file at a time
   - Commit after each file

4. **Test thoroughly:**
   - Run affected features
   - Check for regressions

5. **Update docs:**
   - Update `PROGRESS_TRACKER.md`
   - Mark completed in refactoring guide

---

### Task: Fixing Bug

1. **Reproduce:**
   - Understand the issue
   - Document steps to reproduce

2. **Locate:**
   - Find relevant code
   - Identify root cause

3. **Fix:**
   - Make minimal change
   - Add comments if complex

4. **Test:**
   - Verify fix works
   - Check for side effects

5. **Document:**
   ```markdown
   ## Bug Fix - Feb 7, 2026

   **Issue:** D9 calculation incorrect for Pisces ascendant
   
   **Root Cause:** Off-by-one error in sign calculation
   
   **Fix:** Corrected modulo operation in calculateDivisionalSign()
   
   **Testing:** Verified with 5 test cases
   ```

---

## 📝 Handoff Checklist

### Before Ending Session

- [ ] Update `PROGRESS_TRACKER.md` with completed tasks
- [ ] Commit all changes with clear messages
- [ ] Push to `dev` branch
- [ ] Create session summary (if major work done)
- [ ] Document any blockers or questions
- [ ] Note what's next for the other AI

### When Starting Session

- [ ] Read latest session summary (if exists)
- [ ] Check `git log -5` for recent changes
- [ ] Review `PROGRESS_TRACKER.md` for current state
- [ ] Ask Aakash about priorities
- [ ] Confirm no merge conflicts

---

## 🤝 Collaboration Examples

### Example 1: Continuing Refactoring

**Claude's Handoff:**
> "Started divisional chart refactoring. Created shared builder in `divisionalChartBuilder.ts`. Updated D7 and D12. Next: Update D2 and D3 using same pattern."

**ChatGPT's Response:**
1. Read `divisionalChartBuilder.ts`
2. Check how D7 was updated
3. Apply same pattern to D2 and D3
4. Test all 4 charts
5. Update progress tracker

---

### Example 2: API Development

**ChatGPT's Handoff:**
> "Added authentication middleware. Applied to `/api/calculate` and `/api/dasha/*`. Need to add to `/api/chart/*` CRUD routes. Middleware is in `lib/api/middleware.ts`."

**Claude's Response:**
1. Review middleware implementation
2. Update all `/api/chart/*` routes:
   - POST /api/chart
   - GET /api/chart
   - GET /api/chart/[id]
   - PUT /api/chart/[id]
   - DELETE /api/chart/[id]
3. Add rate limiting
4. Test with Postman
5. Update API docs

---

## 🎯 Success Criteria

### Good Handoff Indicators
- ✅ Next AI can continue without questions
- ✅ Clear what's done vs in-progress
- ✅ Documentation updated
- ✅ No merge conflicts
- ✅ Tests passing

### Poor Handoff Indicators
- ❌ Next AI has to ask many questions
- ❌ Unclear what's complete
- ❌ Uncommitted changes
- ❌ Merge conflicts
- ❌ Broken build

---

## 📞 When to Ask Aakash

### Always Ask About:
- Major architectural decisions
- Database migration choices
- New dependencies
- Deployment issues
- User-facing changes

### Can Decide Independently:
- Code refactoring patterns
- Component organization
- Utility function names
- Comment improvements
- Documentation updates

---

## 🔗 Key Resources

### Essential Docs
- `README.md` - Project overview
- `DEVELOPMENT_ROADMAP.md` - Priorities & timeline
- `PROGRESS_TRACKER.md` - Current status
- `COMPONENT_LIBRARY.md` - All components
- `CODE_REFACTORING_GUIDE.md` - Refactoring tasks

### Reference
- `PROJECT_OVERVIEW.md` - Architecture
- `SETUP_CHECKLIST.md` - Setup guide
- `DIAMONDCHART_IMPROVEMENTS_TASK.md` - Specific task

---

**Remember:** The goal is seamless collaboration. When in doubt, over-communicate!

**Last Updated:** February 7, 2026  
**Maintained By:** Claude & ChatGPT  
**For:** Aakash (Solo Developer)
