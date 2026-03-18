#!/bin/bash
# Runs every Saturday at 8:30 AM
# Scans the codebase and saves a snapshot to Claude Memory for reuse by doc-audit

set -e

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/codebase-snapshot.log"
MEMORY_FILE="/home/deploy/.claude/projects/-var-www-astrotattwa-web/memory/codebase_snapshot.md"

mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$MEMORY_FILE")"

echo "[$(date)] Starting codebase snapshot..." | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

PROMPT="You are running an automated codebase snapshot task for the astrotattwa-web project at /var/www/astrotattwa-web.

Your job is to scan the entire codebase and save a detailed snapshot to memory. This snapshot will be reused by the doc-audit-weekly task at 9:00 AM to avoid duplicate scanning.

## Steps

1. Scan all source files:
   - Components: src/components/**/*.tsx
   - Hooks: src/hooks/**/*.ts
   - Pages/Routes: src/app/**/*.tsx
   - Types: src/types/**/*.ts
   - API routes: src/app/api/**/*.ts
   - Lib/utils: src/lib/**/*.ts

2. For each component file found:
   - Record its file path
   - Check if it is imported anywhere in the codebase (active) or not (dead code)
   - Note its exported component names

3. Record the tech stack from package.json (key dependencies and their versions)

4. Record recent git changes: run 'git log --oneline -20' to see last 20 commits

5. Save the complete snapshot to: $MEMORY_FILE

Format the snapshot file as:

---
name: Codebase Snapshot
description: Weekly scan of all components, hooks, routes, types, and git activity
type: project
date: $(date +%Y-%m-%d)
---

# Codebase Snapshot — $(date +%Y-%m-%d)

## Tech Stack
[list key deps from package.json]

## Components (Active)
[list each active component with file path]

## Components (Dead Code)
[list each unused component with file path]

## Hooks
[list all hooks]

## API Routes
[list all API routes]

## Types
[list all type files]

## Recent Git Activity (last 20 commits)
[git log output]

## Summary
- Total components: X (active: Y, dead: Z)
- Total hooks: X
- Total API routes: X
- Last commit: [date and message]"

/home/deploy/.nvm/versions/node/v20.20.0/bin/claude --dangerously-skip-permissions -p "$PROMPT" --model claude-sonnet-4-6 >> "$LOG_FILE" 2>&1

echo "[$(date)] Codebase snapshot complete." | tee -a "$LOG_FILE"
