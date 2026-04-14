---
description: Use after completing any feature or bug fix, before deploying. Dispatches a fresh subagent that reads the actual git diff and evaluates code quality — catches what self-review misses.
---

# Code Review

A fresh subagent reviews the actual changes with no prior context — it cannot be biased by knowing how the code was written.

## Step 1 — Get the Diff

```bash
git diff HEAD~1 --stat          # what files changed
git diff HEAD~1                 # full diff
```

If changes span multiple commits:
```bash
git log --oneline -10           # find the base commit
git diff <base-sha> HEAD        # diff since feature started
```

## Step 2 — Collect the Requirements

Write a 3-5 line summary of what this change was supposed to do:
- What user-facing behavior was added/fixed?
- What files were intentionally changed?
- Any known constraints or edge cases that were handled?

## Step 3 — Dispatch the Reviewer Subagent

Launch a fresh Agent with this prompt (fill in the blanks):

```
You are a code reviewer for the Astrotattwa Vedic astrology app (Next.js 16, React 18, TypeScript, Supabase, Tailwind).

## What changed
<paste requirements summary from Step 2>

## The diff
<paste full git diff>

## Your job
Review this diff and report issues in three categories:

**CRITICAL** — Will cause bugs, data loss, security issues, or broken UX in production. Must fix before deploying.

**IMPORTANT** — Doesn't break things today but will cause problems soon: stale closures, missing error handling at boundaries, wrong dep arrays, race conditions, TypeScript `any` on public interfaces.

**MINOR** — Code quality: naming, redundant code, missing edge case handling that's unlikely to occur.

## Rules
- Read the actual diff. Do NOT assume the implementation is correct because the description says so.
- For every React hook change: verify dependency arrays are complete and correct.
- For every async operation: verify error handling exists.
- For every Supabase query: verify RLS will allow it for the intended user.
- For every URL param or localStorage read: verify null/undefined is handled.
- For every state update after await: check if component could have unmounted.

Report only real issues. If a category has no issues, say "None found."
```

## Step 4 — Act on the Report

| Category | Action |
|---|---|
| CRITICAL | Fix before deploying — no exceptions |
| IMPORTANT | Fix now if quick; log as known issue if complex |
| MINOR | Fix if trivial; skip if not worth the churn |

After fixing CRITICAL/IMPORTANT issues, run `/verify` again before deploying.
