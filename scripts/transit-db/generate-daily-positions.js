#!/usr/bin/env node

/**
 * Astrotattwa — Planet Transit Database
 * Step 5: Daily Positions Generator (One-Time Script)
 *
 * Computes daily positions for all 9 planets over a rolling
 * 8-year window: current year -2 → current year +5.
 * Today (March 2026): covers 2024-01-01 → 2031-12-31
 *
 * Also populates planet_retrograde_periods as a byproduct —
 * detects when planet speed crosses zero (SR/SD events).
 *
 * Usage:
 *   node generate-daily-positions.js
 *
 * - One shot, no PM2 needed
 * - Safe to re-run (unique constraints ignore duplicates)
 * - Annual maintenance: re-run with --extend flag each January
 *     node generate-daily-positions.js --extend
 *   This adds next year and deletes rows older than 2 years.
 *
 * Required env vars (reads .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY  (optional)
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const { createClient } = require('@supabase/supabase-js');

// ─────────────────────────────────────────────────────────────
// 1. ENV
// ─────────────────────────────────────────────────────────────

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;
const ALERT_TO     = 'aakashjain1992@gmail.com';
const ALERT_FROM   = 'noreply@astrotattwa.com';
const IS_EXTEND    = process.argv.includes('--extend');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────────────────────
// 2. DATE RANGE
// ─────────────────────────────────────────────────────────────

const now       = new Date();
const THIS_YEAR = now.getFullYear();

let START_DATE, END_DATE;

if (IS_EXTEND) {
  // Annual maintenance: add next year only
  const nextYear = THIS_YEAR + 1;
  START_DATE = new Date(Date.UTC(nextYear, 0, 1));
  END_DATE   = new Date(Date.UTC(nextYear, 11, 31));
  console.log(`Mode: --extend (adding ${nextYear} only)`);
} else {
  // Full initial run: current year -2 → +5
  START_DATE = new Date(Date.UTC(THIS_YEAR - 2, 0, 1));
  END_DATE   = new Date(Date.UTC(THIS_YEAR + 5, 11, 31));
}

// ─────────────────────────────────────────────────────────────
// 3. PLANET CONFIG
// ─────────────────────────────────────────────────────────────

const PLANETS = [
  { name: 'Sun',     isNode: false, isKetu: false },
  { name: 'Moon',    isNode: false, isKetu: false },
  { name: 'Mars',    isNode: false, isKetu: false },
  { name: 'Mercury', isNode: false, isKetu: false },
  { name: 'Jupiter', isNode: false, isKetu: false },
  { name: 'Venus',   isNode: false, isKetu: false },
  { name: 'Saturn',  isNode: false, isKetu: false },
  { name: 'Rahu',    isNode: true,  isKetu: false },
  { name: 'Ketu',    isNode: true,  isKetu: true  },
];

const SIGN_NAMES = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Each nakshatra spans 360/27 = 13.333...° of the zodiac
const NAKSHATRA_SPAN = 360 / 27;

function getNakshatra(lon) {
  const idx = Math.floor(((lon % 360) + 360) % 360 / NAKSHATRA_SPAN);
  return NAKSHATRAS[idx] || 'Unknown';
}

function getNakshatraPada(lon) {
  const posInNak = (((lon % 360) + 360) % 360 % NAKSHATRA_SPAN);
  return Math.floor(posInNak / (NAKSHATRA_SPAN / 4)) + 1;
}

// ─────────────────────────────────────────────────────────────
// 4. SWISS EPHEMERIS
// ─────────────────────────────────────────────────────────────

let swe = null;

function getSwe() {
  if (!swe) {
    swe = require('swisseph');
    const ephePath = path.join(process.cwd(), 'public', 'ephe');
    swe.swe_set_ephe_path(ephePath);
    swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  }
  return swe;
}

function getBodyId(planetName) {
  const s = getSwe();
  switch (planetName) {
    case 'Sun':     return s.SE_SUN;
    case 'Moon':    return s.SE_MOON;
    case 'Mars':    return s.SE_MARS;
    case 'Mercury': return s.SE_MERCURY;
    case 'Jupiter': return s.SE_JUPITER;
    case 'Venus':   return s.SE_VENUS;
    case 'Saturn':  return s.SE_SATURN;
    case 'Rahu':    return s.SE_MEAN_NODE;
    case 'Ketu':    return s.SE_MEAN_NODE; // Rahu + 180°
    default: throw new Error(`Unknown planet: ${planetName}`);
  }
}

function dateToJd(date) {
  const s = getSwe();
  return s.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    12, // noon UTC
    s.SE_GREG_CAL
  );
}

/**
 * Compute all 9 planets for a single Julian Day in one pass.
 * Returns array of { name, lon, speed, isRetrograde }.
 */
function computeAllPlanets(jd) {
  const s       = getSwe();
  const flags   = s.SEFLG_SIDEREAL | s.SEFLG_SPEED;
  const results = [];

  // Compute Rahu once — Ketu derives from it
  let rahuLon   = null;
  let rahuSpeed = null;

  for (const planet of PLANETS) {
    if (planet.isKetu) continue; // handle after Rahu

    const bodyId = getBodyId(planet.name);
    const res    = s.swe_calc_ut(jd, bodyId, flags);

    if (!res || typeof res.longitude !== 'number') {
      throw new Error(`swe_calc_ut failed for ${planet.name} at JD ${jd}: ${res?.error || 'unknown'}`);
    }

    const lon   = res.longitude;
    const speed = res.longitudeSpeed ?? 0;

    if (planet.name === 'Rahu') {
      rahuLon   = lon;
      rahuSpeed = speed;
    }

    results.push({ name: planet.name, lon, speed, isRetrograde: speed < 0 });
  }

  // Ketu = Rahu + 180°
  if (rahuLon !== null) {
    const ketuLon = (rahuLon + 180) % 360;
    results.push({ name: 'Ketu', lon: ketuLon, speed: rahuSpeed, isRetrograde: false });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// 5. ROW BUILDERS
// ─────────────────────────────────────────────────────────────

function buildDailyRow(dateStr, planet) {
  const lon          = ((planet.lon % 360) + 360) % 360;
  const sign         = Math.floor(lon / 30) + 1;
  const degreeInSign = lon % 30;

  return {
    planet:         planet.name,
    date:           dateStr,
    longitude:      parseFloat(lon.toFixed(6)),
    sign,
    sign_name:      SIGN_NAMES[sign],
    degree_in_sign: parseFloat(degreeInSign.toFixed(6)),
    nakshatra:      getNakshatra(lon),
    nakshatra_pada: getNakshatraPada(lon),
    is_retrograde:  planet.isRetrograde,
    speed:          parseFloat(planet.speed.toFixed(6)),
  };
}

// ─────────────────────────────────────────────────────────────
// 6. RETROGRADE PERIOD DETECTION
// ─────────────────────────────────────────────────────────────

// Planets that can retrograde (Sun, Moon, Rahu, Ketu never do)
const RETROGRADE_PLANETS = new Set(['Saturn', 'Jupiter', 'Mars', 'Mercury', 'Venus']);

// Tracks open retrograde periods per planet
// { planetName → { start: Date, startSign: string } }
const openRetrogrades = {};

// Completed retrograde periods ready to insert
const completedRetrogrades = [];

function trackRetrograde(planetName, date, speed, signName) {
  if (!RETROGRADE_PLANETS.has(planetName)) return;

  const wasOpen = openRetrogrades[planetName];

  if (speed < 0 && !wasOpen) {
    // Station Retrograde (SR) — planet just went retrograde
    openRetrogrades[planetName] = { start: date, startSign: signName };
  } else if (speed >= 0 && wasOpen) {
    // Station Direct (SD) — planet just resumed forward motion
    const sr        = wasOpen;
    const durationDays = Math.round((date - sr.start) / 86400000);
    completedRetrogrades.push({
      planet:          planetName,
      retrograde_start: sr.start.toISOString(),
      direct_start:     date.toISOString(),
      sign_at_sr:       sr.startSign,
      sign_at_sd:       signName,
      duration_days:    durationDays,
    });
    delete openRetrogrades[planetName];
  }
}

// ─────────────────────────────────────────────────────────────
// 7. SUPABASE HELPERS
// ─────────────────────────────────────────────────────────────

async function insertBatch(table, rows, conflictCol) {
  if (rows.length === 0) return 0;
  const BATCH = 500; // larger batches — rows are small
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: conflictCol, ignoreDuplicates: true })
      .select('id');

    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
    inserted += data ? data.length : 0;
  }
  return inserted;
}

async function deleteOldPositions() {
  // Delete rows older than 2 years from today (annual maintenance)
  const cutoff = new Date(Date.UTC(THIS_YEAR - 2, 0, 1)).toISOString().slice(0, 10);
  const { error } = await supabase
    .from('planet_daily_positions')
    .delete()
    .lt('date', cutoff);

  if (error) throw new Error(`Failed to delete old positions: ${error.message}`);
  console.log(`  Deleted rows older than ${cutoff}`);
}

// ─────────────────────────────────────────────────────────────
// 8. EMAIL
// ─────────────────────────────────────────────────────────────

async function sendCompletionEmail(stats) {
  if (!RESEND_KEY) {
    console.log('\n[email] RESEND_API_KEY not set — skipping.');
    return;
  }

  const html = `
    <h2>✅ Daily Positions Generation Complete</h2>
    <table border="1" cellspacing="0" style="border-collapse:collapse;font-family:monospace">
      <tr><td style="padding:4px 8px">Date range</td>
          <td style="padding:4px 8px">${stats.startDate} → ${stats.endDate}</td></tr>
      <tr><td style="padding:4px 8px">Total days</td>
          <td style="padding:4px 8px">${stats.totalDays}</td></tr>
      <tr><td style="padding:4px 8px">Daily position rows</td>
          <td style="padding:4px 8px">${stats.positionsInserted.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 8px">Retrograde periods</td>
          <td style="padding:4px 8px">${stats.retrogradesInserted}</td></tr>
      <tr><td style="padding:4px 8px">Duration</td>
          <td style="padding:4px 8px">${stats.duration}</td></tr>
    </table>
    <br>
    <p><strong>Next step:</strong> Run the astronomical events post-processing script.</p>
    <p><em>Annual maintenance:</em> Run <code>node generate-daily-positions.js --extend</code>
    each January 1 to add the next year.</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    ALERT_FROM,
        to:      [ALERT_TO],
        subject: `[Transit DB] ✅ Daily positions complete — ${stats.positionsInserted.toLocaleString()} rows`,
        html,
      }),
    });
    if (!res.ok) console.warn(`[email] Resend error ${res.status}: ${await res.text()}`);
    else         console.log(`[email] Completion email sent.`);
  } catch (err) {
    console.warn(`[email] Failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 9. MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now();

  console.log('='.repeat(60));
  console.log('Astrotattwa — Generate Daily Positions');
  console.log('='.repeat(60));
  console.log(`Range:  ${START_DATE.toISOString().slice(0,10)} → ${END_DATE.toISOString().slice(0,10)}`);
  console.log(`Mode:   ${IS_EXTEND ? 'extend (add next year + trim old)' : 'full initial run'}`);
  console.log();

  // Annual maintenance: delete old rows before inserting new ones
  if (IS_EXTEND) {
    console.log('Trimming rows older than 2 years...');
    await deleteOldPositions();
    console.log();
  }

  // Build date list
  const dates = [];
  for (let d = new Date(START_DATE); d <= END_DATE; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(new Date(d));
  }
  const totalDays = dates.length;
  console.log(`Processing ${totalDays} days × 9 planets = ${(totalDays * 9).toLocaleString()} rows...`);
  console.log();

  // Process in chunks — compute rows in memory, insert in batches
  const CHUNK_DAYS   = 365;  // process 1 year at a time to show progress
  const dailyBuffer  = [];
  let posInserted    = 0;
  let lastPercent    = -1;

  for (let i = 0; i < dates.length; i++) {
    const date    = dates[i];
    const dateStr = date.toISOString().slice(0, 10);
    const jd      = dateToJd(date);

    const planets = computeAllPlanets(jd);

    for (const planet of planets) {
      dailyBuffer.push(buildDailyRow(dateStr, planet));
      trackRetrograde(planet.name, date, planet.speed, SIGN_NAMES[Math.floor(((planet.lon % 360) + 360) % 360 / 30) + 1]);
    }

    // Flush buffer every CHUNK_DAYS or at the end
    if (dailyBuffer.length >= CHUNK_DAYS * 9 || i === dates.length - 1) {
      const inserted = await insertBatch(
        'planet_daily_positions',
        dailyBuffer,
        'planet,date'
      );
      posInserted += inserted;
      dailyBuffer.length = 0; // clear buffer

      const pct = Math.floor((i + 1) / totalDays * 100);
      if (pct !== lastPercent) {
        process.stdout.write(
          `\r  Progress: ${pct}%  (${(i + 1).toLocaleString()}/${totalDays.toLocaleString()} days,` +
          ` ${posInserted.toLocaleString()} rows inserted)`
        );
        lastPercent = pct;
      }
    }
  }

  console.log('\n');

  // Insert completed retrograde periods
  console.log(`Retrograde periods detected: ${completedRetrogrades.length}`);
  const retroInserted = await insertBatch(
    'planet_retrograde_periods',
    completedRetrogrades,
    'planet,retrograde_start'
  );
  console.log(`Retrograde periods inserted: ${retroInserted}`);

  // Print retrograde summary
  const byPlanet = {};
  for (const r of completedRetrogrades) {
    byPlanet[r.planet] = (byPlanet[r.planet] || 0) + 1;
  }
  for (const [p, count] of Object.entries(byPlanet)) {
    console.log(`  ${p.padEnd(10)} ${count} retrograde periods`);
  }
  console.log();

  // Verify
  console.log('Verifying row counts in Supabase...');
  const { count: posCount } = await supabase
    .from('planet_daily_positions')
    .select('*', { count: 'exact', head: true });
  const { count: retCount } = await supabase
    .from('planet_retrograde_periods')
    .select('*', { count: 'exact', head: true });
  console.log(`  planet_daily_positions:    ${posCount?.toLocaleString()} rows`);
  console.log(`  planet_retrograde_periods: ${retCount} rows`);
  console.log();

  const duration = ((Date.now() - t0) / 1000).toFixed(1) + 's';

  const stats = {
    startDate:          START_DATE.toISOString().slice(0, 10),
    endDate:            END_DATE.toISOString().slice(0, 10),
    totalDays,
    positionsInserted:  posInserted,
    retrogradesInserted: retroInserted,
    duration,
  };

  await sendCompletionEmail(stats);

  console.log('='.repeat(60));
  console.log(`Done in ${duration}.`);
  console.log(`Daily positions: ${posInserted.toLocaleString()} rows inserted`);
  console.log(`Retrograde periods: ${retroInserted} rows inserted`);
  console.log();
  console.log('Annual maintenance (run each Jan 1):');
  console.log('  node generate-daily-positions.js --extend');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
