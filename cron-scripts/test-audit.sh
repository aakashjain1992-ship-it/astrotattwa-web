#!/bin/bash
# TEST SCRIPT — runs full audit pipeline for a single file (COMPONENT_LIBRARY.md)
# Usage: cd /var/www/astrotattwa-web && ./cron-scripts/test-audit.sh
# Tests: codebase snapshot → 7-step audit → branch → email → approve/reject

set -e

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/test-audit.log"
SNAPSHOT_FILE="/var/www/astrotattwa-web/cron-scripts/memory/codebase_snapshot.md"
CLAUDE="/home/deploy/.nvm/versions/node/v20.20.0/bin/claude"
AUDIT_DATE=$(date +%Y-%m-%d)
BRANCH="docs/audit-$AUDIT_DATE"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$SNAPSHOT_FILE")"

# Load environment variables (needed for RESEND_API_KEY used by send-audit-email.ts)
set -a
source "$PROJECT_DIR/.env.local" 2>/dev/null || true
set +a

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "[$(date)] TEST RUN STARTED" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# ─── PHASE 1: Codebase Snapshot ───────────────────────────────────────────────
echo "[$(date)] Phase 1: Codebase snapshot..." | tee -a "$LOG_FILE"

SNAPSHOT_PROMPT="You are running an automated codebase snapshot task for the astrotattwa-web project at /var/www/astrotattwa-web.

Deeply scan the codebase and save a structured snapshot to memory.

## Step 1 — COMPONENTS
Glob: src/components/**/*.tsx
For each file found:
- Record the file path
- Count how many times the component is imported across src/ by running:
  grep -r 'import.*ComponentName' src/ --include='*.tsx' --include='*.ts' | wc -l
- Classify as:
  - ACTIVE: imported in at least one page, layout, or other component
  - DEAD: zero imports found anywhere in src/

## Step 2 — HOOKS
Glob: src/hooks/**/*.ts
For each hook file:
- Record the file path and hook name
- Check if it is imported anywhere in src/
- Classify as ACTIVE or UNUSED

## Step 3 — API ROUTES
Glob: src/app/api/**/route.ts
For each route file:
- Record the file path
- Note which HTTP methods are exported (GET, POST, PUT, DELETE, PATCH)

## Step 4 — TYPES
Glob: src/types/**/*.ts
List each type file path.

## Step 5 — TECH STACK
Read package.json and extract all dependencies and devDependencies with their exact versions.

## Step 6 — DIRECTORY TREE
Run: ls src/
Record the top-level structure of the src/ directory.

## Step 7 — GIT ACTIVITY
Run: git log --since='7 days ago' --oneline -- '*.tsx' '*.ts'
Summarize which files changed and what features were added or modified.

## Step 8 — SAVE SNAPSHOT
Write the complete snapshot to: $SNAPSHOT_FILE

Use this exact format:

---
name: Codebase Snapshot
description: Weekly automated snapshot of all components, hooks, routes, types, and their usage status
type: project
date: $AUDIT_DATE
---

# Codebase Snapshot — $AUDIT_DATE

## Tech Stack
[all deps from package.json with versions]

## Directory Structure
[output of ls src/]

## Components (Active)
[component name — file path — import count]

## Components (Dead Code)
[component name — file path — 0 imports]

## Hooks (Active)
[hook name — file path]

## Hooks (Unused)
[hook name — file path]

## API Routes
[route path — file path — HTTP methods: GET, POST, ...]

## Types
[file path]

## Git Activity (past 7 days)
[git log output]

## Summary
- Total components: X (active: Y, dead: Z)
- Total hooks: X (active: Y, unused: Z)
- Total API routes: X
- Files changed this week: X
- Snapshot generated: $AUDIT_DATE"

$CLAUDE --dangerously-skip-permissions -p "$SNAPSHOT_PROMPT" --model claude-sonnet-4-6 2>&1 | tee -a "$LOG_FILE"
echo "[$(date)] Phase 1 complete." | tee -a "$LOG_FILE"

# ─── PHASE 2: Audit COMPONENT_LIBRARY.md ──────────────────────────────────────
echo "[$(date)] Phase 2: Auditing COMPONENT_LIBRARY.md..." | tee -a "$LOG_FILE"

AUDIT_PROMPT="You are running an automated documentation audit for the astrotattwa-web project at /var/www/astrotattwa-web.

Today is $AUDIT_DATE. This is a TEST RUN auditing one file: COMPONENT_LIBRARY.md (doc type: Entity Catalog).

## STEP 1 — READ CODEBASE SNAPSHOT
Read the memory file at: $SNAPSHOT_FILE
Use this as a starting index only — it tells you what files exist and their rough usage status.
Do NOT treat it as ground truth for the audit. For every claim you verify, go read the actual source file.
The snapshot saves time on discovery; the audit quality depends on reading real code.

## STEP 2 — READ DOC
Read /var/www/astrotattwa-web/COMPONENT_LIBRARY.md.
List every verifiable claim: component names, file paths, counts, active/dead classifications.

## STEP 3 — DISCOVER CODEBASE
Use the snapshot to locate files quickly, then READ the actual source files directly.
- For each component claimed in the doc: read its actual .tsx file, check real exports, real props, real usage
- For counts: glob and count actual files, do not rely on snapshot numbers
- For active/dead status: grep actual imports across src/ for each entity
- For API routes: read the actual route.ts file, check real HTTP methods and logic
- For versions: read package.json directly

## STEP 4 — CREATE GAP
Classify every claim as:
- ACCURATE: claim matches codebase reality
- PHANTOM: claim refers to something that does not exist in codebase
- MISSING: something exists in codebase but not mentioned in doc
- STALE: was true but now outdated (wrong path, wrong count, etc.)

## STEP 5 — RE-VERIFY & RATE
Double-check each PHANTOM and MISSING finding by reading the actual file.
Rate accuracy 1–10:
- 9–10: ≤5% claims wrong
- 7–8: 6–15% claims wrong
- 5–6: 16–30% claims wrong
- <5: >30% claims wrong

## STEP 6 — REVERSE ENGINEER
Deep-scan for components the doc should cover but missed entirely:
- New components added since last audit (check git log)
- Import patterns revealing active vs dead status changes
- Any hooks, routes, or UI elements relevant to COMPONENT_LIBRARY

## STEP 7 — GENERATE FINAL
Write the complete updated COMPONENT_LIBRARY.md.
- Preserve existing structure and formatting
- Remove all PHANTOM entries
- Add all MISSING entries
- Fix all STALE entries
- Bump version number and update date

## STEP 8 — BRANCH & COMMIT
1. git checkout -b $BRANCH
2. Write the updated COMPONENT_LIBRARY.md to disk
3. git add COMPONENT_LIBRARY.md
4. git commit -m 'docs: TEST audit COMPONENT_LIBRARY.md $AUDIT_DATE'
5. git push origin $BRANCH

## STEP 9 — SEND EMAIL
Send audit results using:
cd /var/www/astrotattwa-web && npx tsx scripts/send-audit-email.ts \
  --to 'aakashjain1992@gmail.com' \
  --subject 'TEST Doc Audit — COMPONENT_LIBRARY.md $AUDIT_DATE' \
  --summary '[summary: rating, phantoms removed, missing added, stale fixed, key changes]' \
  --diff-url 'https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...$BRANCH' \
  --rating '[your accuracy rating 1-10]'

## STEP 10 — WAIT FOR APPROVAL
Poll for email reply every 5 minutes for up to 1 hour.

- If reply contains APPROVE:
  git checkout dev
  git merge $BRANCH
  git push origin dev
  npm run build
  pm2 restart astrotattwa-web
  git branch -d $BRANCH
  Print: 'APPROVED. Changes merged to dev and deployed.'

- If reply contains REJECT or no reply after 1 hour:
  git checkout dev
  git branch -d $BRANCH
  git push origin --delete $BRANCH
  Print: 'REJECTED or timed out. Branch deleted.'"

$CLAUDE --dangerously-skip-permissions -p "$AUDIT_PROMPT" --model claude-sonnet-4-6 2>&1 | tee -a "$LOG_FILE"

echo "========================================" | tee -a "$LOG_FILE"
echo "[$(date)] TEST RUN COMPLETE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
