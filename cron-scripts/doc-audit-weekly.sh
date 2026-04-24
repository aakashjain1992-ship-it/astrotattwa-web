#!/bin/bash
# Weekly documentation audit — runs every Saturday at 9:00 AM IST (3:34 AM UTC)
# Does: audit docs → commit to branch → push → email you → EXIT
# Approval is handled separately by doc-audit-approve.sh (runs hourly)

export PATH="/home/deploy/.nvm/versions/node/v20.20.0/bin:$PATH"
export HOME="/home/deploy"

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/doc-audit-weekly.log"
SNAPSHOT_FILE="$PROJECT_DIR/cron-scripts/memory/codebase_snapshot.md"
PENDING_FILE="$PROJECT_DIR/cron-scripts/logs/pending-audit-branch.txt"

mkdir -p "$(dirname "$LOG_FILE")"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"; }

# Rotate log if over 1 MB
if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  mv "$LOG_FILE" "${LOG_FILE}.bak"
fi

log "========================================"
log "Starting doc audit"
log "========================================"

# Load environment variables (needed for RESEND_API_KEY)
set -a
source "$PROJECT_DIR/.env.local" 2>/dev/null || true
set +a

cd "$PROJECT_DIR" || { log "ERROR: Cannot cd to $PROJECT_DIR"; exit 1; }

# Check for code changes in past 7 days
CHANGES=$(git log --oneline --since="7 days ago" -- '*.tsx' '*.ts' 2>/dev/null | wc -l)
if [ "$CHANGES" -eq 0 ]; then
  log "No code changes in the past week. Skipping audit."
  exit 0
fi
log "Found $CHANGES commits in the past week. Proceeding."

# Clean up any stale pending branch from a previous run that was never approved/rejected
if [ -f "$PENDING_FILE" ]; then
  STALE_BRANCH=$(cat "$PENDING_FILE" | tr -d '[:space:]')
  if [ -n "$STALE_BRANCH" ]; then
    log "Cleaning up stale pending branch from previous run: $STALE_BRANCH"
    git push origin --delete "$STALE_BRANCH" 2>/dev/null || true
  fi
  rm -f "$PENDING_FILE"
fi

AUDIT_DATE=$(date +%Y-%m-%d)
WEEK=$(( ($(date +%-d) - 1) / 7 + 1 ))

PROMPT="You are running the weekly documentation audit for the astrotattwa-web project at /var/www/astrotattwa-web.

Today is $AUDIT_DATE. This is week $WEEK of the month.

IMPORTANT RULES:
- Do NOT poll or wait for any response. Your job ends after Step 5.
- Do NOT merge to dev, do NOT build, do NOT reload PM2. A separate script handles that.
- Do NOT output full document contents to the terminal — only print a short summary of what changed.
- If a command fails, log the error and continue — do not stop the entire audit.

## STEP 0 — CHECK FOR CHANGES
Run: git log --since='7 days ago' --oneline -- '*.tsx' '*.ts'
If no output → print 'No code changes this week. Skipping.' and stop.

## STEP 1 — DETERMINE WHICH DOCS ARE DUE
Based on week $WEEK of the month:
- EVERY Saturday (weeks 1, 2, 3, 4): COMPONENT_LIBRARY.md, PROGRESS_TRACKER.md
- 1st & 3rd Saturday (weeks 1, 3): also PROJECT_OVERVIEW.md, DEVELOPMENT_ROADMAP.md, CODE_QUALITY.md
- 1st Saturday only (week 1): also AI_HANDOFF_GUIDE.md, DELIVERY_SUMMARY.md, README.md

Print the list of files due today before proceeding.

## STEP 2 — READ CODEBASE SNAPSHOT
Read: $SNAPSHOT_FILE
Use as a starting index only — it tells you what files exist and rough usage status.
Do NOT treat it as ground truth. For every claim you verify, read the actual source file.
If the snapshot file does not exist or is unreadable, skip this step and proceed with direct codebase reads.

## STEP 3 — AUDIT EACH DUE DOCUMENT
For each due file, run all 7 steps:

**Step 3.1 — DISCOVER DOC**
Read the document. Identify its doc type:
- Entity Catalog (COMPONENT_LIBRARY) → read actual .tsx files, trace real imports, verify real props
- Architecture Overview (PROJECT_OVERVIEW, DELIVERY_SUMMARY, README) → read package.json directly, run ls on directories
- Progress Tracker (PROGRESS_TRACKER, DEVELOPMENT_ROADMAP) → run git log, check if referenced files/features exist
- Procedural Guide (AI_HANDOFF_GUIDE) → verify each file path exists, check each command is valid
- Quality Analysis (CODE_QUALITY) → special handling, see below

**Special handling for CODE_QUALITY.md:**
This document is a living health check — NOT a gap-check like other docs. Do NOT classify claims as PHANTOM/MISSING/STALE.
Instead, perform a fresh analysis each time:
1. Grep for duplicated patterns across src/ (similar function signatures, repeated logic blocks)
2. Find zero-import components/hooks (dead code): glob src/components/**/*.tsx and src/hooks/**/*.ts, grep each for imports
3. Find large client-side files without dynamic import (bundle risk)
4. Check src/types/ for any local type re-definitions in other files
5. Read git log --since='7 days ago' to find new files added this week
6. Write a verdict: 'Refactoring recommended' or 'No refactoring needed' with specific reasoning
7. Always rewrite the entire document — bump version, update date, update all sections from scratch
8. The 'Completed Refactors' section is historical — preserve it as-is, do not re-audit those items

**Step 3.2 — LIST CLAIMS**
List every verifiable claim: component names, file paths, version numbers, counts, feature statuses.

**Step 3.3 — VERIFY AGAINST CODEBASE**
Use the snapshot to locate files quickly, then READ actual source files directly.
- For each component claimed: read its actual .tsx file, check real exports, real props, real usage
- For counts: glob and count actual files — do not rely on snapshot numbers
- For active/dead status: grep actual imports across src/ for each entity
- For API routes: read the actual route.ts file, check real HTTP methods
- For versions: read package.json directly

**Step 3.4 — CLASSIFY FINDINGS**
Classify every claim:
- ACCURATE: claim matches codebase reality
- PHANTOM: claim refers to something that does not exist in codebase
- MISSING: something exists in codebase but is not mentioned in doc
- STALE: claim was once true but is now outdated (wrong version, wrong path, etc.)

**Step 3.5 — RATE & DEEP-DIVE**
Rate the document accuracy 1–10:
- 9–10: ≤5% claims wrong
- 7–8: 6–15% claims wrong
- 5–6: 16–30% claims wrong
- <5: >30% claims wrong

If rating < 8, run the DEEP-DIVE LOOP (up to 3 passes):
1. List every PHANTOM and MISSING you are not 100% certain about
2. For each: open and READ the actual file directly — do not rely on grep or snapshot
3. For PHANTOM: try alternate file paths, check barrel exports, check index files
4. For MISSING: search more broadly with wider glob patterns
5. Re-rate after each pass
After 3 passes, note 'Maximum deep-dive iterations reached' and continue.

**Step 3.6 — FIND NEW THINGS**
Scan for things the doc should cover but missed entirely:
- New components added since last audit (check git log)
- Hooks, routes, or types not mentioned in the doc
- Import patterns revealing active vs dead code status changes

**Step 3.7 — WRITE UPDATED DOCUMENT**
Write the complete updated document to disk. Preserve the existing structure and formatting. Bump the version number and date. Remove all PHANTOM entries. Add all MISSING entries. Fix all STALE entries.

If a document has ZERO findings (all claims accurate, nothing missing) → skip it, do not write a new version.

## STEP 4 — CREATE BRANCH & COMMIT
Only if at least one document was updated:

1. git checkout -b docs/audit-$AUDIT_DATE
2. git add [only the .md files that changed]
3. git commit -m 'docs: automated audit $AUDIT_DATE'
4. git push origin docs/audit-$AUDIT_DATE
5. echo 'docs/audit-$AUDIT_DATE' > $PENDING_FILE

If all documents were already accurate → print 'All docs up to date. No changes needed.' and stop. Do NOT write to $PENDING_FILE. Do NOT send email.

## STEP 5 — SEND EMAIL
Build the email summary:
- For each file audited: filename, rating (X/10), count of phantoms removed / missing added / stale fixed
- Overall average confidence rating (average of all per-file ratings, rounded to 1 decimal)
- GitHub diff URL: https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$AUDIT_DATE

Then run:
cd /var/www/astrotattwa-web && npx tsx scripts/send-audit-email.ts \
  --to 'aakashjain1992@gmail.com' \
  --subject 'Doc Audit — $AUDIT_DATE' \
  --summary '[your full summary here]' \
  --diff-url 'https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$AUDIT_DATE' \
  --rating '[overall average rating]'

Your task is complete after Step 5. Stop here."

log "Running Claude audit (timeout: 90 min)..."
timeout 5400 /home/deploy/.nvm/versions/node/v20.20.0/bin/claude \
  --dangerously-skip-permissions \
  --max-turns 200 \
  -p "$PROMPT" \
  --model claude-sonnet-4-6 >> "$LOG_FILE" 2>&1
CLAUDE_EXIT=$?

if [ $CLAUDE_EXIT -eq 124 ]; then
  log "ERROR: Claude timed out after 90 minutes. Audit incomplete."
elif [ $CLAUDE_EXIT -ne 0 ]; then
  log "ERROR: Claude exited with code $CLAUDE_EXIT. Check log above for details."
else
  log "Claude audit completed successfully."
fi

log "========================================"
log "Doc audit run finished"
log "========================================"
