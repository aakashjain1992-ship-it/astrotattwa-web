#!/bin/bash
# Runs every Saturday at 9:00 AM
# Audits documentation files on a staggered schedule and emails results

set -e

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/doc-audit-weekly.log"
SNAPSHOT_FILE="/home/deploy/.claude/projects/-var-www-astrotattwa-web/memory/codebase_snapshot.md"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date)] Starting doc audit..." | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Check if there were any code changes in the past 7 days
CHANGES=$(git log --oneline --since="7 days ago" -- src/ 2>/dev/null | wc -l)
if [ "$CHANGES" -eq 0 ]; then
  echo "[$(date)] No code changes in the past week. Skipping audit." | tee -a "$LOG_FILE"
  exit 0
fi

echo "[$(date)] Found $CHANGES commits in the past week. Proceeding with audit." | tee -a "$LOG_FILE"

# Determine current week of month (for staggered schedule)
WEEK=$(( ($(date +%-d) - 1) / 7 + 1 ))
MONTH_DAY=$(date +%-d)

PROMPT="You are running an automated documentation audit for the astrotattwa-web project at /var/www/astrotattwa-web.

Today is $(date +%Y-%m-%d). Week of month: $WEEK.

## Staggered Audit Schedule

Audit these files TODAY based on schedule:
- WEEKLY (every Saturday): COMPONENT_LIBRARY.md, PROGRESS_TRACKER.md
- BI-WEEKLY (weeks 1 & 3): PROJECT_OVERVIEW.md, DEVELOPMENT_ROADMAP.md
- MONTHLY (week 1 only): AI_HANDOFF_GUIDE.md, CODE_REFACTORING_GUIDE.md, DELIVERY_SUMMARY.md, README.md

Determine which files are due today (week $WEEK of the month), then audit only those files.

## Codebase Snapshot

A codebase snapshot was saved at 8:30 AM today to: $SNAPSHOT_FILE
Read this file first to avoid re-scanning the codebase.

## 7-Step Audit Process (for each file due today)

For each doc file that is due:

**Step 1 — DISCOVER DOC**: Read the doc file and understand its purpose, structure, and doc type (Entity Catalog, Architecture Overview, Progress Tracker, Procedural Guide, or Task Doc).

**Step 2 — READ DOC**: List all claims, entries, and information stated in the doc.

**Step 3 — DISCOVER CODEBASE**: Using the codebase snapshot (already loaded), map relevant codebase facts to this doc's scope.

**Step 4 — CREATE GAP**: Compare doc claims vs codebase reality. List:
- Items in doc but NOT in codebase (phantom/outdated)
- Items in codebase but NOT in doc (missing)
- Items that are inaccurate (wrong counts, wrong paths, wrong descriptions)

**Step 5 — RE-VERIFY & RATE**: Double-check each gap item by reading the actual file. Rate accuracy 1-10:
- 9-10: High confidence, doc matches codebase well
- 7-8: Mostly accurate, minor gaps
- 5-6: Notable gaps, review recommended
- <5: Significant inaccuracies, manual review required

**Step 6 — REVERSE ENGINEER**: Deep-scan the codebase for anything the doc should cover but missed. Check imports, exports, and actual usage patterns.

**Step 7 — GENERATE FINAL**: Write the complete updated document.

## After Auditing All Due Files

1. Create a new git branch: docs/audit-$(date +%Y-%m-%d)
2. Write each updated doc to its file
3. Run: git add [doc files] && git commit -m 'docs: automated audit $(date +%Y-%m-%d)'
4. Run: git push origin docs/audit-$(date +%Y-%m-%d)

5. Build a summary email body with:
   - List of files audited
   - Per-file accuracy rating (X/10) with key changes made
   - Overall average confidence rating
   - GitHub diff URL: https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$(date +%Y-%m-%d)

6. Calculate overall rating (average of all per-file ratings, rounded to 1 decimal)

7. Send the email using:
   cd /var/www/astrotattwa-web && npx tsx scripts/send-audit-email.ts \
     --to 'aakashjain1992@gmail.com' \
     --subject 'Doc Audit — $(date +%Y-%m-%d)' \
     --summary '[your summary here]' \
     --diff-url 'https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$(date +%Y-%m-%d)' \
     --rating '[overall rating]'

8. Wait for email reply (check every 5 minutes for up to 2 hours):
   - If reply contains APPROVE: run 'git checkout dev && git merge docs/audit-$(date +%Y-%m-%d) && git push origin dev && npm run build && pm2 restart astrotattwa-web'
   - If reply contains REJECT or no reply after 2 hours: run 'git branch -d docs/audit-$(date +%Y-%m-%d) && git push origin --delete docs/audit-$(date +%Y-%m-%d)'"

/home/deploy/.nvm/versions/node/v20.20.0/bin/claude --dangerously-skip-permissions -p "$PROMPT" --model claude-sonnet-4-6 >> "$LOG_FILE" 2>&1

echo "[$(date)] Doc audit complete." | tee -a "$LOG_FILE"
