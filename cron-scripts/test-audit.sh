#!/bin/bash
# TEST SCRIPT — runs full audit pipeline for a single file
# Usage: ./cron-scripts/test-audit.sh
# Tests: codebase snapshot → audit COMPONENT_LIBRARY.md → email → approve/reject

set -e

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/test-audit.log"
SNAPSHOT_FILE="/home/deploy/.claude/projects/-var-www-astrotattwa-web/memory/codebase_snapshot.md"
CLAUDE="/home/deploy/.nvm/versions/node/v20.20.0/bin/claude"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$SNAPSHOT_FILE")"

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "[$(date)] TEST RUN STARTED" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# ─── STEP 1: Codebase Snapshot ────────────────────────────────────────────────
echo "[$(date)] Step 1/2: Running codebase snapshot..." | tee -a "$LOG_FILE"

SNAPSHOT_PROMPT="You are running an automated codebase snapshot task for the astrotattwa-web project at /var/www/astrotattwa-web.

Scan the codebase and save a snapshot to memory. This will be reused by the doc audit.

Steps:
1. Scan all source files:
   - Components: src/components/**/*.tsx
   - Hooks: src/hooks/**/*.ts
   - Pages/Routes: src/app/**/*.tsx
   - Types: src/types/**/*.ts
   - API routes: src/app/api/**/*.ts
   - Lib/utils: src/lib/**/*.ts

2. For each component file:
   - Record file path
   - Check if it is imported anywhere (active) or not (dead code)
   - Note exported component names

3. Record key dependencies and versions from package.json

4. Run: git log --oneline -10

5. Save snapshot to: $SNAPSHOT_FILE

Format:
---
name: Codebase Snapshot
description: Weekly scan of all components, hooks, routes, types, and git activity
type: project
date: $(date +%Y-%m-%d)
---

# Codebase Snapshot — $(date +%Y-%m-%d)

## Tech Stack
[key deps]

## Components (Active)
[active components with file paths]

## Components (Dead Code)
[unused components with file paths]

## Hooks
[all hooks]

## API Routes
[all API routes]

## Types
[all type files]

## Recent Git Activity
[git log output]

## Summary
- Total components: X (active: Y, dead: Z)
- Total hooks: X
- Total API routes: X
- Last commit: [date and message]"

$CLAUDE --dangerously-skip-permissions -p "$SNAPSHOT_PROMPT" --model claude-sonnet-4-6 2>&1 | tee -a "$LOG_FILE"
echo "[$(date)] Snapshot complete." | tee -a "$LOG_FILE"

# ─── STEP 2: Audit COMPONENT_LIBRARY.md ───────────────────────────────────────
echo "[$(date)] Step 2/2: Auditing COMPONENT_LIBRARY.md..." | tee -a "$LOG_FILE"

AUDIT_DATE=$(date +%Y-%m-%d)
BRANCH="docs/audit-$AUDIT_DATE"

AUDIT_PROMPT="You are running an automated documentation audit for the astrotattwa-web project at /var/www/astrotattwa-web.

Today is $AUDIT_DATE. This is a test run auditing ONE file: COMPONENT_LIBRARY.md.

## Codebase Snapshot
A codebase snapshot was saved today to: $SNAPSHOT_FILE
Read this file first to avoid re-scanning the codebase.

## 7-Step Audit for COMPONENT_LIBRARY.md

**Step 1 — DISCOVER DOC**: Read /var/www/astrotattwa-web/COMPONENT_LIBRARY.md. Identify its doc type (Entity Catalog).

**Step 2 — READ DOC**: List all component entries, sections, and claims.

**Step 3 — DISCOVER CODEBASE**: Using the snapshot at $SNAPSHOT_FILE, map all components found in the codebase.

**Step 4 — CREATE GAP**: Compare doc entries vs codebase reality:
- Components in doc but NOT in codebase (phantom)
- Components in codebase but NOT in doc (missing)
- Inaccurate counts or descriptions

**Step 5 — RE-VERIFY & RATE**: Double-check gaps by reading actual files. Rate accuracy 1-10.

**Step 6 — REVERSE ENGINEER**: Deep-scan imports and exports to catch anything the doc missed.

**Step 7 — GENERATE FINAL**: Write the complete updated COMPONENT_LIBRARY.md.

## After Audit

1. Create branch: $BRANCH
   Run: git checkout -b $BRANCH

2. Write the updated COMPONENT_LIBRARY.md to disk.

3. Commit:
   Run: git add COMPONENT_LIBRARY.md && git commit -m 'docs: audit COMPONENT_LIBRARY.md $AUDIT_DATE'

4. Push:
   Run: git push origin $BRANCH

5. Send email using (replace [summary] and [rating] with actual values):
   cd /var/www/astrotattwa-web && npx tsx scripts/send-audit-email.ts \
     --to 'aakashjain1992@gmail.com' \
     --subject 'TEST Doc Audit — COMPONENT_LIBRARY.md $AUDIT_DATE' \
     --summary '[your audit summary: what changed, what was accurate, what was missing]' \
     --diff-url 'https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...$BRANCH' \
     --rating '[your accuracy rating 1-10]'

6. Poll for email reply every 5 minutes for up to 1 hour:
   - If reply contains APPROVE:
     git checkout dev && git merge $BRANCH && git push origin dev && npm run build && pm2 restart astrotattwa-web && git branch -d $BRANCH
   - If reply contains REJECT or timeout after 1 hour:
     git checkout dev && git branch -d $BRANCH && git push origin --delete $BRANCH"

$CLAUDE --dangerously-skip-permissions -p "$AUDIT_PROMPT" --model claude-sonnet-4-6 2>&1 | tee -a "$LOG_FILE"

echo "========================================" | tee -a "$LOG_FILE"
echo "[$(date)] TEST RUN COMPLETE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
