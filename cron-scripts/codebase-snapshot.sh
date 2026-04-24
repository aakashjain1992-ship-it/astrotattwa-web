#!/bin/bash
# Runs every Saturday at 8:30 AM
# Scans the codebase and saves a snapshot to Claude Memory for reuse by doc-audit

# Ensure node/claude work in cron (no nvm, no HOME by default)
export PATH="/home/deploy/.nvm/versions/node/v20.20.0/bin:$PATH"
export HOME="/home/deploy"

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/codebase-snapshot.log"
MEMORY_FILE="/var/www/astrotattwa-web/cron-scripts/memory/codebase_snapshot.md"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$MEMORY_FILE")"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"; }

log "Starting codebase snapshot..."

cd "$PROJECT_DIR"

PROMPT="You are running an automated codebase snapshot task for the astrotattwa-web project at /var/www/astrotattwa-web.

Your job is to deeply scan the entire codebase and save a structured snapshot to memory. This snapshot will be reused by the doc-audit-weekly task at 9:00 AM to avoid duplicate scanning.

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
Summarize: which files changed, what features were added or modified.

## Step 8 — SAVE SNAPSHOT
Write the complete snapshot to: $MEMORY_FILE

Use this exact format:

---
name: Codebase Snapshot
description: Weekly automated snapshot of all components, hooks, routes, types, and their usage status
type: project
date: $(date +%Y-%m-%d)
---

# Codebase Snapshot — $(date +%Y-%m-%d)

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
- Snapshot generated: $(date +%Y-%m-%d %H:%M UTC)"

log "Running Claude snapshot (timeout: 30 min)..."
timeout 1800 /home/deploy/.nvm/versions/node/v20.20.0/bin/claude \
  --dangerously-skip-permissions \
  --max-turns 100 \
  -p "$PROMPT" \
  --model claude-sonnet-4-6 >> "$LOG_FILE" 2>&1
CLAUDE_EXIT=$?

if [ $CLAUDE_EXIT -eq 124 ]; then
  log "ERROR: Claude timed out after 30 minutes."
elif [ $CLAUDE_EXIT -ne 0 ]; then
  log "ERROR: Claude exited with code $CLAUDE_EXIT."
else
  log "Codebase snapshot complete."
fi
