#!/bin/bash
# Approval handler for doc audit — runs every hour via cron
# Checks for APPROVE/REJECT in logs/email-reply.txt and acts on it.
# Auto-rejects branches older than 24 hours.
#
# To approve:  echo "APPROVE" > /var/www/astrotattwa-web/cron-scripts/logs/email-reply.txt
# To reject:   echo "REJECT"  > /var/www/astrotattwa-web/cron-scripts/logs/email-reply.txt

export PATH="/home/deploy/.nvm/versions/node/v20.20.0/bin:$PATH"
export HOME="/home/deploy"

PROJECT_DIR="/var/www/astrotattwa-web"
LOG_FILE="$PROJECT_DIR/cron-scripts/logs/doc-audit-weekly.log"
PENDING_FILE="$PROJECT_DIR/cron-scripts/logs/pending-audit-branch.txt"
REPLY_FILE="$PROJECT_DIR/cron-scripts/logs/email-reply.txt"

mkdir -p "$(dirname "$LOG_FILE")"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S UTC')] [approve] $1" | tee -a "$LOG_FILE"; }

# Nothing pending — exit silently (runs every hour, this is the normal case)
if [ ! -f "$PENDING_FILE" ]; then exit 0; fi

BRANCH_NAME=$(cat "$PENDING_FILE" | tr -d '[:space:]')
if [ -z "$BRANCH_NAME" ]; then
  rm -f "$PENDING_FILE"
  exit 0
fi

# Auto-reject if branch is older than 24 hours
BRANCH_DATE=$(echo "$BRANCH_NAME" | grep -oP '\d{4}-\d{2}-\d{2}' || true)
if [ -n "$BRANCH_DATE" ]; then
  BRANCH_EPOCH=$(date -d "$BRANCH_DATE" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  AGE_HOURS=$(( (NOW_EPOCH - BRANCH_EPOCH) / 3600 ))
  if [ "$AGE_HOURS" -gt 24 ]; then
    log "Branch '$BRANCH_NAME' is $AGE_HOURS hours old. Auto-rejecting."
    cd "$PROJECT_DIR" && git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
    rm -f "$PENDING_FILE" "$REPLY_FILE"
    exit 0
  fi
fi

# No reply yet — nothing to do
if [ ! -f "$REPLY_FILE" ]; then exit 0; fi

REPLY=$(cat "$REPLY_FILE" | tr '[:lower:]' '[:upper:]' | tr -d '[:space:]')
log "Reply received: '$REPLY' for branch: $BRANCH_NAME"

cd "$PROJECT_DIR" || { log "ERROR: Cannot cd to $PROJECT_DIR"; exit 1; }

if echo "$REPLY" | grep -q "APPROVE"; then
  log "Merging $BRANCH_NAME into dev..."
  git fetch origin
  git checkout dev
  git pull origin dev
  if git merge --no-ff "origin/$BRANCH_NAME" -m "docs: merge audit $(date +%Y-%m-%d)"; then
    git push origin dev
    git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
    log "APPROVED. Branch merged to dev and deleted. (Docs-only — no build needed.)"
  else
    log "ERROR: Merge failed. Manual intervention required."
    git merge --abort 2>/dev/null || true
    rm -f "$REPLY_FILE"
    exit 1
  fi
elif echo "$REPLY" | grep -q "REJECT"; then
  log "Rejecting. Deleting branch $BRANCH_NAME..."
  git push origin --delete "$BRANCH_NAME" 2>/dev/null || true
  log "REJECTED. Branch deleted."
else
  log "Unrecognized reply: '$REPLY'. Write APPROVE or REJECT to $REPLY_FILE."
  exit 0
fi

rm -f "$PENDING_FILE" "$REPLY_FILE"
