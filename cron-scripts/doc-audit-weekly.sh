#!/bin/bash
# Runs every Saturday at 9:00 AM
# Audits documentation files on a staggered schedule and emails results

set -e

# Ensure node/claude work in cron (no nvm, no HOME by default)
export PATH="/home/deploy/.nvm/versions/node/v20.20.0/bin:$PATH"
export HOME="/home/deploy"

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/doc-audit-weekly.log"
SNAPSHOT_FILE="/var/www/astrotattwa-web/cron-scripts/memory/codebase_snapshot.md"

mkdir -p "$(dirname "$LOG_FILE")"

# Load environment variables (needed for RESEND_API_KEY used by send-audit-email.ts)
set -a
source "$PROJECT_DIR/.env.local" 2>/dev/null || true
set +a

echo "[$(date)] Starting doc audit..." | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Check if there were any code changes in the past 7 days
CHANGES=$(git log --oneline --since="7 days ago" -- '*.tsx' '*.ts' 2>/dev/null | wc -l)
if [ "$CHANGES" -eq 0 ]; then
  echo "[$(date)] No code changes in the past week. Skipping audit." | tee -a "$LOG_FILE"
  exit 0
fi

echo "[$(date)] Found $CHANGES commits in the past week. Proceeding with audit." | tee -a "$LOG_FILE"

# Determine current week of month (for staggered schedule)
WEEK=$(( ($(date +%-d) - 1) / 7 + 1 ))

PROMPT="You are running the weekly documentation audit for the astrotattwa-web project at /var/www/astrotattwa-web.

Today is $(date +%Y-%m-%d). This is week $WEEK of the month.

## STEP 0 — CHECK FOR CHANGES
Run: git log --since='7 days ago' --oneline -- '*.tsx' '*.ts'
If no output → print 'No code changes this week. Skipping.' and stop.

## STEP 1 — DETERMINE WHICH DOCS ARE DUE
Calculate based on week $WEEK of the month:
- EVERY Saturday (weeks 1, 2, 3, 4): COMPONENT_LIBRARY.md, PROGRESS_TRACKER.md
- 1st & 3rd Saturday (weeks 1, 3): also PROJECT_OVERVIEW.md, DEVELOPMENT_ROADMAP.md
- 1st Saturday only (week 1): also AI_HANDOFF_GUIDE.md, CODE_REFACTORING_GUIDE.md, DELIVERY_SUMMARY.md, README.md

List which files are due today before proceeding.

## STEP 2 — READ CODEBASE SNAPSHOT
Read the memory file at: $SNAPSHOT_FILE
Use this as a starting index only — it tells you what files exist and their rough usage status.
Do NOT treat it as ground truth for the audit. For every claim you verify, go read the actual source file.
The snapshot saves time on discovery; the audit quality depends on reading real code.

## STEP 3 — AUDIT EACH DUE DOCUMENT
For each due file, run all 7 steps:

**Step 3.1 — DISCOVER DOC**
Read the document. Identify its doc type:
- Entity Catalog (COMPONENT_LIBRARY) → read actual .tsx files, trace real imports, verify real props
- Architecture Overview (PROJECT_OVERVIEW, DELIVERY_SUMMARY, README) → read package.json directly, run ls on directories
- Progress Tracker (PROGRESS_TRACKER, DEVELOPMENT_ROADMAP) → run git log, check if referenced files/features exist
- Procedural Guide (AI_HANDOFF_GUIDE) → verify each file path exists, test each command is valid
- Task Doc (CODE_REFACTORING_GUIDE) → grep for referenced patterns in actual code, check completion status

**Step 3.2 — READ DOC**
List every verifiable claim in the document: component names, file paths, version numbers, counts, feature statuses.

**Step 3.3 — DISCOVER CODEBASE**
Use the snapshot to locate files quickly, then READ the actual source files directly.
- For each component claimed in the doc: read its actual .tsx file, check real exports, real props, real usage
- For counts: glob and count actual files, do not rely on snapshot numbers
- For active/dead status: grep actual imports across src/ for each entity
- For API routes: read the actual route.ts file, check real HTTP methods and logic
- For versions: read package.json directly

**Step 3.4 — CREATE GAP**
Classify every claim as one of:
- ACCURATE: claim matches codebase reality
- PHANTOM: claim refers to something that does not exist in codebase
- MISSING: something exists in codebase but is not mentioned in doc
- STALE: claim was once true but is now outdated (wrong version, wrong path, etc.)

**Step 3.5 — RE-VERIFY & RATE (with deep-dive loop)**
Rate the document accuracy 1–10:
- 9–10: High confidence, doc matches codebase well (≤5% claims wrong)
- 7–8: Mostly accurate, minor gaps (6–15% claims wrong)
- 5–6: Notable gaps, review recommended (16–30% claims wrong)
- <5: Significant inaccuracies, manual review required (>30% claims wrong)

**Target: reach a rating of 8 or above. If your rating is below 8, do a deeper evaluation pass:**

DEEP-DIVE LOOP (repeat up to 3 times until rating ≥ 8):
1. List every PHANTOM and MISSING finding you are not 100% certain about
2. For each uncertain finding: open and READ the actual file directly — do not rely on grep results or the snapshot
3. For each PHANTOM: try alternate file paths, alternate component names, check index files and barrel exports
4. For each MISSING: search more broadly — check subdirectories, re-run glob with wider patterns
5. For any STALE claim: re-read the actual file and confirm the current value
6. After each deep-dive pass, re-rate the document
7. If rating is still below 8, repeat the deep-dive pass (up to 3 total iterations)
8. After 3 passes, proceed with whatever rating you have and note: "Maximum deep-dive iterations reached"

Only proceed to Step 3.6 when rating ≥ 8 OR after 3 deep-dive iterations.

**Step 3.6 — REVERSE ENGINEER**
Deep-scan for things the doc should cover but missed entirely:
- New components added since last audit (check git log)
- Hooks, routes, or types not mentioned anywhere in the doc
- Import patterns that reveal active vs dead code status changes

**Step 3.7 — GENERATE FINAL**
Write the complete updated document. Preserve the existing structure and formatting. Bump the version number and update the date. Remove all PHANTOM entries. Add all MISSING entries. Fix all STALE entries.

If a document has ZERO findings (all claims accurate, nothing missing) → skip it, do not write a new version.

## STEP 4 — CREATE BRANCH & COMMIT
Only if at least one document was updated:

1. git checkout -b docs/audit-$(date +%Y-%m-%d)
2. Write all updated .md files to disk
3. git add [only the changed .md files]
4. git commit -m 'docs: automated audit $(date +%Y-%m-%d)'
5. git push origin docs/audit-$(date +%Y-%m-%d)

If all documents were already accurate → print 'All docs up to date. No changes.' and stop. Do not send email.

## STEP 5 — SEND EMAIL
Build the email summary:
- For each file audited: filename, rating (X/10), count of phantoms removed / missing added / stale fixed
- Overall average confidence rating (average of all per-file ratings, rounded to 1 decimal)
- GitHub diff URL: https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$(date +%Y-%m-%d)

Send using:
cd /var/www/astrotattwa-web && npx tsx scripts/send-audit-email.ts \
  --to 'aakashjain1992@gmail.com' \
  --subject 'Doc Audit — $(date +%Y-%m-%d)' \
  --summary '[your full summary here]' \
  --diff-url 'https://github.com/aakashjain1992-ship-it/astrotattwa-web/compare/dev...docs/audit-$(date +%Y-%m-%d)' \
  --rating '[overall average rating]'

## STEP 6 — WAIT FOR APPROVAL
Poll for email reply every 5 minutes for up to 2 hours.
Check by reading /var/www/astrotattwa-web/cron-scripts/logs/email-reply.txt if it exists.

- If reply contains APPROVE:
  git checkout dev
  git merge docs/audit-$(date +%Y-%m-%d)
  git push origin dev
  npm run build
  pm2 restart astrotattwa-web
  git branch -d docs/audit-$(date +%Y-%m-%d)
  Print: 'APPROVED. Changes merged to dev and deployed.'

- If reply contains REJECT or no reply after 2 hours:
  git checkout dev
  git branch -d docs/audit-$(date +%Y-%m-%d)
  git push origin --delete docs/audit-$(date +%Y-%m-%d)
  Print: 'REJECTED or timed out. Branch deleted.'"

/home/deploy/.nvm/versions/node/v20.20.0/bin/claude --dangerously-skip-permissions -p "$PROMPT" --model claude-sonnet-4-6 >> "$LOG_FILE" 2>&1

echo "[$(date)] Doc audit complete." | tee -a "$LOG_FILE"
