/**
 * Astrotattwa — Planet Transit Database
 * Step 2: Seed transit_generation_log
 *
 * Inserts 257 pending rows:
 *   Phase 1 — sign_transits  / Saturn / 1940–2100  → 161 rows
 *   Phase 2 — daily_positions / ALL   / rolling 8 yrs → 96 rows
 *
 * Usage:
 *   node seed-transit-log.js
 *
 * Requires env vars (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← must be service role, NOT anon key
 *
 * Safe to re-run — unique constraint silently ignores duplicates.
 * Run from /var/www/astrotattwa-web on the Linode server.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ── Load .env.local ──────────────────────────────────────────
// Next.js doesn't auto-load .env.local for plain Node scripts,
// so we parse it manually here.
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// ── Validate env ─────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Missing required env vars.');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'ok' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? 'ok' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Phase 1: Saturn sign_transits rows ───────────────────────
// One row per year, 1940–2100 inclusive = 161 rows.
function buildSaturnRows() {
  const rows = [];
  for (let year = 1940; year <= 2100; year++) {
    rows.push({
      phase:   'sign_transits',
      planet:  'Saturn',
      period:  String(year),
      status:  'pending',
    });
  }
  return rows;
}

// ── Phase 2: daily_positions rows ────────────────────────────
// Rolling 8-year window: current year -2 through current year +5.
// One row per month = 8 × 12 = 96 rows.
// Today = March 2026 → window = Jan 2024 – Dec 2031.
function buildDailyPositionRows() {
  const now        = new Date();
  const startYear  = now.getFullYear() - 2;  // 2024
  const endYear    = now.getFullYear() + 5;  // 2031

  const rows = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const mm = String(month).padStart(2, '0');
      rows.push({
        phase:   'daily_positions',
        planet:  'ALL',
        period:  `${year}-${mm}`,
        status:  'pending',
      });
    }
  }
  return rows;
}

// ── Insert helper ─────────────────────────────────────────────
// Supabase JS doesn't have a native "ON CONFLICT DO NOTHING" option
// for bulk inserts, but ignoreDuplicates:true on upsert achieves it.
// We batch to stay well under Supabase's 1MB request limit.
async function insertBatch(rows, batchSize = 100) {
  let inserted = 0;
  let skipped  = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('transit_generation_log')
      .upsert(batch, {
        onConflict:       'phase,planet,period',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) {
      console.error(`\nERROR on batch starting at index ${i}:`, error.message);
      throw error;
    }

    // data = rows actually inserted (duplicates are silently dropped).
    const batchInserted = data ? data.length : 0;
    const batchSkipped  = batch.length - batchInserted;
    inserted += batchInserted;
    skipped  += batchSkipped;

    process.stdout.write(
      `\r  Processed ${Math.min(i + batchSize, rows.length)} / ${rows.length} rows` +
      `  (inserted: ${inserted}, skipped: ${skipped})`
    );
  }

  console.log(); // newline after progress line
  return { inserted, skipped };
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('Astrotattwa — Seed transit_generation_log');
  console.log('='.repeat(60));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log();

  // ── Phase 1: Saturn ─────────────────────────────────────────
  const saturnRows = buildSaturnRows();
  console.log(`Phase 1 — sign_transits / Saturn`);
  console.log(`  Years: 1940–2100  |  Rows to create: ${saturnRows.length}`);

  const p1 = await insertBatch(saturnRows);
  console.log(`  Done. Inserted: ${p1.inserted}  Skipped (already exist): ${p1.skipped}`);
  console.log();

  // ── Phase 2: Daily positions ─────────────────────────────────
  const dailyRows  = buildDailyPositionRows();
  const startMonth = dailyRows[0].period;
  const endMonth   = dailyRows[dailyRows.length - 1].period;
  console.log(`Phase 2 — daily_positions / ALL`);
  console.log(`  Months: ${startMonth} – ${endMonth}  |  Rows to create: ${dailyRows.length}`);

  const p2 = await insertBatch(dailyRows);
  console.log(`  Done. Inserted: ${p2.inserted}  Skipped (already exist): ${p2.skipped}`);
  console.log();

  // ── Summary ──────────────────────────────────────────────────
  const totalInserted = p1.inserted + p2.inserted;
  const totalSkipped  = p1.skipped  + p2.skipped;
  const totalExpected = saturnRows.length + dailyRows.length;

  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`  Expected rows : ${totalExpected}  (161 Saturn + ${dailyRows.length} daily)`);
  console.log(`  Inserted      : ${totalInserted}`);
  console.log(`  Skipped       : ${totalSkipped}  (already existed — safe)`);
  console.log();

  // ── Verify via SELECT COUNT ───────────────────────────────────
  console.log('Verifying row counts in Supabase...');

  const { count: saturnCount, error: e1 } = await supabase
    .from('transit_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('phase', 'sign_transits')
    .eq('planet', 'Saturn');

  const { count: dailyCount, error: e2 } = await supabase
    .from('transit_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('phase', 'daily_positions')
    .eq('planet', 'ALL');

  if (e1 || e2) {
    console.error('  Verification query failed:', e1?.message || e2?.message);
  } else {
    const saturnOk = saturnCount === saturnRows.length ? '✓' : '✗ MISMATCH';
    const dailyOk  = dailyCount  === dailyRows.length  ? '✓' : '✗ MISMATCH';
    console.log(`  sign_transits  / Saturn : ${saturnCount} rows  ${saturnOk}`);
    console.log(`  daily_positions / ALL   : ${dailyCount} rows  ${dailyOk}`);

    if (saturnCount !== saturnRows.length || dailyCount !== dailyRows.length) {
      console.error('\nMismatch detected. Check for duplicate or missing rows.');
      process.exit(1);
    }
  }

  console.log();
  console.log('All good. Next step: build transit-cron-worker.js (Saturn cron).');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
