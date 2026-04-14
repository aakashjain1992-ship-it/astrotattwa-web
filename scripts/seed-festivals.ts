// One-time seed / migration helper for festival_calendar.
// All ongoing festival edits should be done directly in Supabase (dashboard or SQL).
//
// Usage: set -a && source .env.local && set +a && npx tsx scripts/seed-festivals.ts
//
// This script is kept for disaster-recovery only (e.g. full table wipe + rebuild).
// To add/edit individual records, use the Supabase dashboard or a targeted SQL insert.

console.log('festival_calendar is managed directly in Supabase.')
console.log('To add or edit festivals, use the Supabase dashboard or run a SQL insert.')
console.log('This script is preserved for disaster-recovery only — no seed data is embedded here.')
