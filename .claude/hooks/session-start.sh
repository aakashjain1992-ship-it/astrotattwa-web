#!/bin/bash
# Injects critical project constraints into every Claude Code session.
# Prevents repeated mistakes around build workflow, UX scope, and deployment.

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "## Astrotattwa Project — Session Constraints\n\nThese rules are non-negotiable and override general defaults:\n\n**BUILD & DEPLOY**\n⚠️ NEVER stop PM2 before building. Build first while PM2 keeps serving, then reload after. No exceptions.\n```\nNODE_OPTIONS='--max-old-space-size=512' npx next build --webpack && pm2 reload astrotattwa-web && pm2 save\n```\n- Do NOT `pm2 stop` before building — old server keeps serving from memory while new build writes in-place\n- Do NOT `rm -rf .next` before building\n- Use `pm2 reload` not `pm2 restart` — reload starts new instance before killing old one (near-zero downtime)\n- If build OOMs: investigate, do not stop PM2 as a workaround\n\n**UX SCOPE**\n- When a feature could live on an existing page OR a new page, always ask the user which they prefer — never assume\n- Do not default to creating a new page without confirming first\n\n**WORKFLOW DISCIPLINE**\n- Complex features (>2 files, new API + UI): run /plan first, get approval before coding\n- Any bug: run /debug — root cause first, no guessing\n- Any completed task: run /verify — re-read files, trace logic, then declare done\n- TypeScript errors don't fail the build (ignoreBuildErrors: true) — run npm run type-check separately\n\n**DEV ENVIRONMENT**\n- All dev happens on this Linode server via SSH — no local setup exists\n- User's office Mac cannot install npm\n- Push changes to github dev branch; production deploys from main via CI/CD"
  }
}
EOF
