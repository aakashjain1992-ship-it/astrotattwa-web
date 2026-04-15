---
description: Use when there is a bug, unexpected behavior, infinite loop, broken UI, failed API call, or any symptom that needs fixing. Use BEFORE attempting any fix.
---

# Systematic Debugging

**Iron Law: Never implement a fix without first identifying the root cause. A fix without a root cause is a guess.**

## Phase 1 — Read the Symptom Precisely

- What exactly is happening? (not "it's broken" — what specific behavior?)
- When does it happen? (always, on specific action, only after navigation?)
- What was the last change before this started?
- Is there a URL, state value, or param that triggers it?

## Phase 2 — Trace the Execution Path

Do NOT touch code yet. Read:
1. Start from the entry point (user action, URL param, useEffect trigger)
2. Follow every function call, state update, and re-render in sequence
3. Write out the exact execution order as you trace it
4. Identify where the actual behavior diverges from the expected behavior

**For React bugs specifically — check these in order:**
- `useEffect` dependency arrays (missing or incorrect deps cause stale closures)
- `useCallback`/`useMemo` deps (stale closures on async callbacks)
- State updates during async operations (component may have re-rendered by then)
- URL param reads in closures (stale searchParams captured at creation time)
- Multiple effects racing on the same state

## Phase 3 — Form a Hypothesis

State your hypothesis explicitly:
> "The bug is caused by X because Y. When Z happens, the code does A instead of B."

If you can't state it clearly, keep tracing — you haven't found the root cause yet.

## Phase 4 — Verify the Hypothesis

Before writing the fix:
- Find the exact line(s) where the bug manifests
- Confirm it matches your hypothesis
- Check if fixing it would cause regressions elsewhere

## Phase 5 — Implement and Verify Fix

- Make the minimal change that fixes the root cause
- Re-read the changed code (apply `/verify` after)
- Confirm the fix addresses the hypothesis, not just the symptom

## Red Flags

| Shortcut | Problem |
|---|---|
| "Let me just try changing X and see" | Guessing. Trace first. |
| "It's probably a timing issue" | Probably is not a root cause. What timing, specifically? |
| "Adding a setTimeout should fix it" | Masking the symptom, not fixing the cause. |
| "The fix is obvious" | State the root cause explicitly before writing any code. |
