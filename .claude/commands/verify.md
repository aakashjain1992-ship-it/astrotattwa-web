---
description: Use when any task is complete or nearly complete, before declaring it done. Also use when asked to review a change, check for bugs, or before deploying.
---

# Verification Before Completion

**Iron Law: Never claim a task is done without fresh evidence from the actual code. "I just wrote it" is not evidence.**

## Step 1 — Re-read Every Changed File

For each file modified in this task:
- Read it fully, not from memory
- Confirm the change is exactly what was intended
- Check for typos, wrong variable names, missing imports

## Step 2 — Trace the Logic End-to-End

Follow the data flow from entry point to output:
- Trace function calls through all layers
- Identify every state transition
- Look for: stale closures, race conditions, null/undefined access, wrong deps arrays in useEffect/useCallback

## Step 3 — Check Integration Points

- Does this change interact with localStorage, URL params, or query strings? Trace those too.
- Does any hook or effect depend on this? Check if its deps array is correct.
- Does this touch the build? Run `npm run type-check` mentally or actually.

## Step 4 — Check for Regressions

- What was working before this change that could now break?
- Is any other component consuming the thing you changed?

## Step 5 — Deploy Check (if deploying)

Before building and deploying:
- Are all files saved?
- Is `pm2 stop astrotattwa-web` in the sequence?
- Is the build command `NODE_OPTIONS='--max-old-space-size=512' npx next build --webpack`?

## Red Flags That Mean "Not Done Yet"

| Rationalization | Reality |
|---|---|
| "The logic is straightforward, it'll work" | Read the code. Verify. |
| "I just wrote this, I know what it does" | Stale closures exist. Read it again. |
| "The build passed so it's fine" | Type errors are suppressed (`ignoreBuildErrors: true`). |
| "I fixed the root cause" | Did you verify the fix actually resolves the symptom? |

Only report completion after completing all 5 steps.
