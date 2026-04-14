---
description: Use when starting any task that changes more than 2 files, introduces a new feature, touches an API route + frontend together, or where the approach isn't immediately obvious. Run BEFORE writing any code.
---

# Feature Planning

**Rule: No code before a plan is agreed on for complex tasks. Planning takes 5 minutes. Undoing bad architecture takes hours.**

## Step 1 — Clarify Requirements

Before anything else, resolve ambiguities:
- What exactly should this do? (user-facing behavior, not implementation)
- What should it NOT do? (scope boundaries)
- Are there existing patterns in this codebase to follow?
- Does this replace something existing, or add new?

If unclear on any of these: **ask before proceeding.**

## Step 2 — Audit What Already Exists

Before designing anything new:
- Search for similar functionality already in the codebase
- Read the relevant existing components/hooks/API routes
- Check `useSavedCharts`, `ChartClient`, existing API patterns — don't reinvent

## Step 3 — Write the Plan

Produce a concrete plan with:

**Files to change** (be specific):
```
- src/hooks/useX.ts — add Y method
- src/app/api/route/route.ts — add Z endpoint
- src/components/X/Y.tsx — add new prop, update JSX
```

**New files to create** (only if truly needed — prefer extending existing):
```
- src/components/X/NewThing.tsx — because [reason existing won't work]
```

**Data flow** (for anything touching API or state):
```
User action → state update → API call → response → UI update
```

**Edge cases to handle:**
- Loading states
- Error states
- Empty states
- Auth states (logged in vs out)

## Step 4 — Check Project Constraints

Before finalizing:
- [ ] Does this need a new page or could it live on an existing page? **Ask the user — don't assume either way.**
- [ ] Does this need a build? (plan for `pm2 stop` → build → restart)
- [ ] Does this touch auth? (check middleware.ts and Supabase RLS)
- [ ] Does this need a new shadcn component? (`npx shadcn@latest add X`)
- [ ] Are there TypeScript types needed in `src/types/astrology.ts`?

## Step 5 — Present and Get Approval

Present the plan to the user. Wait for explicit approval before writing code.

After approval: implement step by step, run `/verify` when done.
