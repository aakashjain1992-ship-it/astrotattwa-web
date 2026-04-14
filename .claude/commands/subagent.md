---
description: Use when building a whole new feature from scratch — new API routes + new UI + new hooks together (e.g. P10 AI Insights, P13 Paid Reports). NOT for small fixes, workflow tweaks, or changes to existing functionality.
---

# Subagent-Driven Feature Development

**Use this when:** Building something new end-to-end (new Supabase table + API + hook + UI component).
**Do NOT use this for:** Bug fixes, tweaking existing components, small workflow changes — just do those directly.

---

## Phase 1 — Write the Spec (before any code)

Produce a spec document covering:

**Feature description:**
- What does this do for the user? (1 paragraph, user-facing language)
- What does it NOT do? (explicit scope boundary)

**Technical breakdown — list every piece:**
```
New API routes:    POST /api/X, GET /api/X/[id]
New DB changes:    table `X`, columns: ...
New hooks:         useX() — what it exposes
New components:    X.tsx — what it renders, what props
Modified files:    ChartClient.tsx (add Y), Header.tsx (add Z link)
```

**Data flow:**
```
User action → hook method → API call → Supabase → response → UI update
```

**Edge cases to handle explicitly:**
- Loading state
- Error state
- Empty/zero state
- Auth: logged in vs logged out behavior
- Mobile layout

**Ask the user:** New page or extend existing page?

Present spec to user. **Get explicit approval before Phase 2.**

---

## Phase 2 — Break Into Independent Tasks

Split the approved spec into tasks that can be implemented independently:

```
Task 1: Database + API layer      (no UI dependency)
Task 2: Hook + data fetching      (depends on Task 1 API shape)
Task 3: Core UI component         (depends on Task 2 hook interface)
Task 4: Integration + wiring      (depends on Tasks 1-3)
```

Rules for task splitting:
- Each task should be completable without the others being finished
- Define the interface/contract between tasks upfront (API shape, hook return type, component props)
- No task should be "just 2 lines" — if it is, merge it into another task

---

## Phase 3 — Implement with Subagents

For each task, dispatch a fresh Agent with:

```
You are implementing Task N of [Feature Name] for Astrotattwa (Next.js 16, React 18, TypeScript, Supabase).

## Your task
<exact task description — copy from spec>

## Interfaces you must match
<API shape / hook return type / component props agreed in Phase 2>

## Relevant existing code to read first
<list specific files — e.g. src/hooks/useSavedCharts.ts for pattern reference>

## Constraints
- Follow existing patterns in the codebase (check the files listed above first)
- No new npm packages without asking
- Supabase queries must work with existing RLS policies
- All new components go in src/components/[feature]/
- All new API routes follow the pattern in src/app/api/save-chart/route.ts

## When done, report:
- DONE: list every file created/modified
- CONCERNS: anything you're unsure about
- BLOCKED: if you hit something unexpected, stop and report rather than guessing
```

Wait for each task to complete before dispatching dependents.

---

## Phase 4 — Two-Stage Review

After all tasks complete, run two reviews in sequence:

**Review 1 — Spec Compliance** (did we build what was agreed?):
Dispatch a fresh Agent:
```
Compare this implementation against the original spec.
Spec: <paste spec from Phase 1>
Files changed: <list>
Check: Is every spec requirement implemented? Is anything extra added that wasn't in scope?
Report: MISSING requirements, OUT_OF_SCOPE additions, SPEC_MET items.
```

**Review 2 — Code Quality:**
Run `/review` with the full diff since the feature branch started.

Fix all CRITICAL issues. Fix IMPORTANT issues. Then deploy.

---

## Phase 5 — Deploy

```bash
pm2 stop astrotattwa-web
NODE_OPTIONS='--max-old-space-size=512' npx next build --webpack
pm2 restart astrotattwa-web && pm2 save
```

Update PROGRESS_TRACKER.md and DEVELOPMENT_ROADMAP.md to mark the feature complete.
