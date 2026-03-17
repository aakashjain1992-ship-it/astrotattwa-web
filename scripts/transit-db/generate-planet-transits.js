#!/usr/bin/env node

/**
 * Astrotattwa — Planet Transit Database
 * Step 4: One-Time Planet Transit Generator
 *
 * Computes sign transits for all planets EXCEPT Saturn:
 *   Jupiter, Mars, Mercury, Venus, Sun  — 2020–2040, with sub-entries
 *   Rahu, Ketu                          — 2020–2040, no sub-entries
 *                                          (mean node, always retrograde)
 *
 * Usage:
 *   node generate-planet-transits.js
 *
 * - Runs once, completes in 5–10 minutes
 * - Safe to re-run (unique constraint silently ignores duplicates)
 * - Does NOT use transit_generation_log (no cron needed)
 * - Sends a single completion email via Resend when done
 *
 * Required env vars (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY  (optional — skipped if missing)
 *
 * Place in: /var/www/astrotattwa-web/generate-planet-transits.js
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

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────────────────────
// 2. PLANET CONFIG
// ─────────────────────────────────────────────────────────────

// Each planet: bodyId (Swiss Ephemeris), hasSubEntries, isNode
// isNode = true for Rahu/Ketu (always retrograde, different crossing logic)
const PLANET_CONFIGS = [
  { name: 'Jupiter', hasSubEntries: true,  isNode: false },
  { name: 'Mars',    hasSubEntries: true,  isNode: false },
  { name: 'Mercury', hasSubEntries: true,  isNode: false },
  { name: 'Venus',   hasSubEntries: true,  isNode: false },
  { name: 'Sun',     hasSubEntries: false, isNode: false },
  { name: 'Rahu',    hasSubEntries: false, isNode: true  },
  { name: 'Ketu',    hasSubEntries: false, isNode: true  },
];

const SIGN_NAMES = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Date range for all non-Saturn planets
const START_YEAR = 2020;
const END_YEAR   = 2040;

// ─────────────────────────────────────────────────────────────
// 3. SWISS EPHEMERIS
// Same patterns as swissEph.ts and transit-cron-worker.js
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
    case 'Mars':    return s.SE_MARS;
    case 'Mercury': return s.SE_MERCURY;
    case 'Venus':   return s.SE_VENUS;
    case 'Jupiter': return s.SE_JUPITER;
    case 'Rahu':    return s.SE_MEAN_NODE;
    case 'Ketu':    return s.SE_MEAN_NODE; // computed as Rahu + 180°
    default: throw new Error(`Unknown planet: ${planetName}`);
  }
}

/**
 * Get planet's sidereal longitude and speed at Julian Day.
 * For Ketu: returns Rahu's position + 180°.
 */
function planetAt(jd, planetName) {
  const s      = getSwe();
  const bodyId = getBodyId(planetName);
  const res    = s.swe_calc_ut(jd, bodyId, s.SEFLG_SIDEREAL | s.SEFLG_SPEED);

  if (!res || typeof res.longitude !== 'number') {
    throw new Error(`swe_calc_ut failed for ${planetName} at JD ${jd}: ${res?.error || 'unknown'}`);
  }

  let lon   = res.longitude;
  let speed = res.longitudeSpeed ?? 0;

  if (planetName === 'Ketu') {
    lon = (lon + 180) % 360;
    // Ketu speed is same magnitude as Rahu but same direction
  }

  return { lon, speed };
}

function lonToSign(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30) + 1;
}

function dateToJd(year, month, day, hour = 12) {
  return getSwe().swe_julday(year, month, day, hour, getSwe().SE_GREG_CAL);
}

function jdToDate(jd) {
  const jd2  = jd + 0.5;
  const Z    = Math.floor(jd2);
  const F    = jd2 - Z;
  const A    = Z < 2299161 ? Z : (() => {
    const a = Math.floor((Z - 1867216.25) / 36524.25);
    return Z + 1 + a - Math.floor(a / 4);
  })();
  const B    = A + 1524;
  const C    = Math.floor((B - 122.1) / 365.25);
  const D    = Math.floor(365.25 * C);
  const E    = Math.floor((B - D) / 30.6001);
  const day  = B - D - Math.floor(30.6001 * E);
  const mon  = E < 14 ? E - 1 : E - 13;
  const yr   = mon > 2 ? C - 4716 : C - 4715;
  const hrs  = F * 24;
  const h    = Math.floor(hrs);
  const mins = (hrs - h) * 60;
  const m    = Math.floor(mins);
  const sec  = Math.min(Math.round((mins - m) * 60), 59);
  return new Date(Date.UTC(yr, mon - 1, day, h, m, sec));
}

/**
 * Is the crossing from → to in the PROGRADE (forward zodiac) direction?
 * For regular planets: Aries→Taurus→...→Pisces→Aries is forward.
 * For nodes (Rahu/Ketu): they always move backward (Pisces→Aquarius...).
 * We call their natural backward motion "forward" so the logic is uniform.
 */
function isForward(fromSign, toSign, isNode) {
  if (isNode) {
    // Nodes move backward: Pisces(12)→Aquarius(11)→...→Aries(1)→Pisces(12)
    if (fromSign === 1  && toSign === 12) return true;   // Aries → Pisces (backward = their forward)
    if (fromSign === 12 && toSign === 1)  return false;
    return toSign < fromSign;
  }
  // Normal planets
  if (fromSign === 12 && toSign === 1)  return true;
  if (fromSign === 1  && toSign === 12) return false;
  return toSign > fromSign;
}

/**
 * Binary search to refine a sign crossing to within ~1 minute.
 */
function refineCrossing(jdLo, jdHi, signAtLo, planetName) {
  const precision = 1 / 1440;
  let lo = jdLo, hi = jdHi;
  while (hi - lo > precision) {
    const mid         = (lo + hi) / 2;
    const { lon }     = planetAt(mid, planetName);
    if (lonToSign(lon) === signAtLo) lo = mid;
    else                             hi = mid;
  }
  return (lo + hi) / 2;
}

// ─────────────────────────────────────────────────────────────
// 4. TRANSIT FINDING
// ─────────────────────────────────────────────────────────────

/**
 * Find all sign crossings for a planet in [jdStart, jdEnd].
 * Returns array of { jd, fromSign, toSign, forward }.
 */
function findAllCrossings(jdStart, jdEnd, planetName, isNode) {
  const stepDays = 1;
  const crossings = [];

  let prevJd   = jdStart;
  let { lon }  = planetAt(jdStart, planetName);
  let prevSign = lonToSign(lon);

  for (let jd = jdStart + stepDays; jd <= jdEnd; jd += stepDays) {
    const { lon: curLon } = planetAt(jd, planetName);
    const sign = lonToSign(curLon);

    if (sign !== prevSign) {
      const crossingJd = refineCrossing(prevJd, jd, prevSign, planetName);
      const forward    = isForward(prevSign, sign, isNode);
      crossings.push({ jd: crossingJd, fromSign: prevSign, toSign: sign, forward });
      prevSign = sign;
    }
    prevJd = jd;
  }

  return crossings;
}

/**
 * Build complete transit records for a planet over [startYear, endYear].
 *
 * For planets with sub-entries (Jupiter, Mars, Mercury, Venus):
 *   Groups forward entries into the same sign, tracking retrograde re-exits
 *   and re-entries to build sub_entries array.
 *
 * For Sun and nodes (Rahu, Ketu):
 *   Each forward crossing into a new sign is a clean transit.
 *   exit_date = next forward crossing out.
 *   sub_entries = NULL.
 */
function buildTransits(planetName, hasSubEntries, isNode) {
  const jdStart = dateToJd(startYear(planetName), 1, 1, 0);
  const jdEnd   = dateToJd(END_YEAR + 1, 1, 1, 0);

  // Scan a bit before start year to catch mid-transit entries
  const jdScanStart = dateToJd(startYear(planetName) - 2, 1, 1, 0);

  const crossings = findAllCrossings(jdScanStart, jdEnd, planetName, isNode);

  const records = [];

  if (!hasSubEntries) {
    // Simple transit: each forward entry → next forward exit
    // Used for Sun, Rahu, Ketu
    for (let i = 0; i < crossings.length; i++) {
      const c = crossings[i];
      if (!c.forward) continue;

      // Entry into a new sign
      const entryJd   = c.jd;
      const entrySign = c.toSign;

      // Find the next forward exit from this sign
      let exitJd = null;
      for (let j = i + 1; j < crossings.length; j++) {
        if (crossings[j].fromSign === entrySign && crossings[j].forward) {
          exitJd = crossings[j].jd;
          break;
        }
      }

      if (!exitJd) continue; // Transit extends beyond end of scan range — skip

      const entryDate    = jdToDate(entryJd);
      const exitDate     = jdToDate(exitJd);
      const durationDays = parseFloat((exitJd - entryJd).toFixed(2));

      // Only include transits that overlap our target range
      if (exitDate.getFullYear() < START_YEAR) continue;
      if (entryDate.getFullYear() > END_YEAR)  continue;

      records.push({
        planet:        planetName,
        planet_id:     getBodyId(planetName),
        sign:          entrySign,
        sign_name:     SIGN_NAMES[entrySign],
        entry_date:    entryDate.toISOString(),
        exit_date:     exitDate.toISOString(),
        duration_days: durationDays,
        sub_entries:   null,
        sub_exits:     null,
        is_retrograde: false,
      });
    }
  } else {
    // Complex transit with sub-entries: Jupiter, Mars, Mercury, Venus
    // Group all crossings related to the same "residency" in a sign.
    // A residency = from first forward entry until last forward exit,
    // potentially interrupted by retrograde exits and re-entries.

    let i = 0;
    while (i < crossings.length) {
      const c = crossings[i];
      if (!c.forward) { i++; continue; }

      const entrySign     = c.toSign;
      const firstEntryJd  = c.jd;
      const subEntryJds  = [firstEntryJd]; // [i] = entry JD for i-th pass
      const subExitJds   = [];             // [i] = departure JD for i-th pass
      let   lastExitJd   = null;
      let   isRetrograde = false;

      // Walk forward through crossings to build this residency
      let j = i + 1;
      while (j < crossings.length) {
        const d = crossings[j];

        if (d.fromSign === entrySign) {
          // Planet is LEAVING entrySign — record exact departure for current pass
          subExitJds.push(d.jd);

          if (d.forward) {
            // Forward exit — candidate for final exit
            lastExitJd = d.jd;
            j++;
            // Look ahead: does the planet come back?
            if (j < crossings.length && crossings[j].toSign === entrySign) {
              // Not the final exit — planet will retrograde back in
              lastExitJd   = null;
              isRetrograde = true;
            } else {
              // This IS the final exit
              break;
            }
          } else {
            // Retrograde exit — planet will come back forward
            isRetrograde = true;
            j++;
          }
        } else if (d.toSign === entrySign) {
          // Re-entry into our sign (after retrograde)
          subEntryJds.push(d.jd);
          j++;
        } else {
          j++;
        }
      }

      if (!lastExitJd) {
        // Could not find final exit in scan range — transit extends beyond END_YEAR+buffer
        // Skip this transit (partial data)
        i++;
        continue;
      }

      const entryDate    = jdToDate(firstEntryJd);
      const exitDate     = jdToDate(lastExitJd);
      const durationDays = parseFloat((lastExitJd - firstEntryJd).toFixed(2));

      // Only include if it overlaps our target range
      if (exitDate.getFullYear() < START_YEAR) { i++; continue; }
      if (entryDate.getFullYear() > END_YEAR)  { i++; continue; }

      const retrograde = isRetrograde || subEntryJds.length > 1;

      // sub_exits must be parallel to sub_entries
      if (subExitJds.length !== subEntryJds.length) {
        console.warn(`  ⚠ sub_entries/sub_exits mismatch for ${planetName} sign ${entrySign}: ${subEntryJds.length} entries vs ${subExitJds.length} exits — skipping`);
        i++;
        continue;
      }

      records.push({
        planet:        planetName,
        planet_id:     getBodyId(planetName),
        sign:          entrySign,
        sign_name:     SIGN_NAMES[entrySign],
        entry_date:    entryDate.toISOString(),
        exit_date:     exitDate.toISOString(),
        duration_days: durationDays,
        sub_entries:   subEntryJds.map(jd => jdToDate(jd).toISOString()),
        sub_exits:     subExitJds.map(jd  => jdToDate(jd).toISOString()),
        is_retrograde: retrograde,
      });

      i = j;
    }
  }

  return records;
}

/**
 * Scan start year — go back 2 years to catch mid-transit at START_YEAR.
 */
function startYear(planetName) {
  return START_YEAR;
}

// ─────────────────────────────────────────────────────────────
// 5. SUPABASE INSERT
// ─────────────────────────────────────────────────────────────

async function insertRecords(records, planetName) {
  if (records.length === 0) {
    console.log(`  No records to insert.`);
    return 0;
  }

  let inserted = 0;
  const batchSize = 100;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('planet_sign_transits')
      .upsert(batch, {
        onConflict:       'planet,sign,entry_date',
        ignoreDuplicates: true,
      })
      .select('id');

    if (error) throw new Error(`Supabase insert failed for ${planetName}: ${error.message}`);
    inserted += data ? data.length : 0;
  }

  return inserted;
}

// ─────────────────────────────────────────────────────────────
// 6. EMAIL
// ─────────────────────────────────────────────────────────────

async function sendCompletionEmail(summary) {
  if (!RESEND_KEY) {
    console.log('\n[email] RESEND_API_KEY not set — skipping completion email.');
    return;
  }

  const rows = summary.map(s =>
    `<tr>
      <td style="padding:4px 8px">${s.planet}</td>
      <td style="padding:4px 8px;text-align:center">${s.records}</td>
      <td style="padding:4px 8px;text-align:center">${s.inserted}</td>
      <td style="padding:4px 8px;text-align:center">${s.duration}s</td>
    </tr>`
  ).join('');

  const totalRecords  = summary.reduce((a, s) => a + s.records, 0);
  const totalInserted = summary.reduce((a, s) => a + s.inserted, 0);

  const html = `
    <h2>✅ Planet Transit Generation Complete</h2>
    <p>All 7 non-Saturn planets have been processed for 2020–2040.</p>
    <table border="1" cellspacing="0" style="border-collapse:collapse;font-family:monospace">
      <thead>
        <tr style="background:#f0f0f0">
          <th style="padding:4px 8px">Planet</th>
          <th style="padding:4px 8px">Records Built</th>
          <th style="padding:4px 8px">Inserted</th>
          <th style="padding:4px 8px">Time</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="font-weight:bold">
          <td style="padding:4px 8px">TOTAL</td>
          <td style="padding:4px 8px;text-align:center">${totalRecords}</td>
          <td style="padding:4px 8px;text-align:center">${totalInserted}</td>
          <td style="padding:4px 8px"></td>
        </tr>
      </tfoot>
    </table>
    <br>
    <p><strong>Next step:</strong> Start the daily positions cron (positions-cron-worker.js).</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    ALERT_FROM,
        to:      [ALERT_TO],
        subject: `[Transit DB] ✅ All planet transits generated — ${totalInserted} rows inserted`,
        html,
      }),
    });
    if (!res.ok) console.warn(`[email] Resend error ${res.status}: ${await res.text()}`);
    else         console.log(`[email] Completion email sent to ${ALERT_TO}`);
  } catch (err) {
    console.warn(`[email] Failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 7. MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('Astrotattwa — Generate Planet Sign Transits (2020–2040)');
  console.log('='.repeat(60));
  console.log(`Planets: Jupiter, Mars, Mercury, Venus, Sun, Rahu, Ketu`);
  console.log(`Range:   ${START_YEAR}–${END_YEAR}`);
  console.log();

  const summary = [];

  for (const config of PLANET_CONFIGS) {
    const { name: planetName, hasSubEntries, isNode } = config;
    const t0 = Date.now();

    console.log(`─── ${planetName} ${'─'.repeat(50 - planetName.length)}`);
    process.stdout.write(`  Building transit records...`);

    let records;
    try {
      records = buildTransits(planetName, hasSubEntries, isNode);
    } catch (err) {
      console.error(`\n  ERROR building ${planetName}: ${err.message}`);
      console.error(err.stack);
      process.exit(1);
    }

    console.log(` ${records.length} records built.`);

    // Print a sample (first 3)
    for (const r of records.slice(0, 3)) {
      const sub = r.sub_entries ? `${r.sub_entries.length} sub-entries` : 'no sub-entries';
      console.log(
        `  → ${r.sign_name.padEnd(12)} ` +
        `${r.entry_date.slice(0,10)} → ${r.exit_date.slice(0,10)}  ` +
        `${String(Math.round(r.duration_days)).padStart(4)}d  ${sub}`
      );
    }
    if (records.length > 3) console.log(`  ... and ${records.length - 3} more`);

    process.stdout.write(`  Inserting into Supabase...`);
    let inserted;
    try {
      inserted = await insertRecords(records, planetName);
    } catch (err) {
      console.error(`\n  ERROR inserting ${planetName}: ${err.message}`);
      process.exit(1);
    }

    const duration = ((Date.now() - t0) / 1000).toFixed(1);
    const skipped  = records.length - inserted;
    console.log(` Done. Inserted: ${inserted}  Skipped (duplicates): ${skipped}  Time: ${duration}s`);
    console.log();

    summary.push({ planet: planetName, records: records.length, inserted, duration });
  }

  // ── Final summary ────────────────────────────────────────────
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`${'Planet'.padEnd(10)} ${'Records'.padStart(8)} ${'Inserted'.padStart(9)} ${'Time'.padStart(7)}`);
  console.log('─'.repeat(38));
  for (const s of summary) {
    console.log(
      `${s.planet.padEnd(10)} ${String(s.records).padStart(8)} ` +
      `${String(s.inserted).padStart(9)} ${(s.duration + 's').padStart(7)}`
    );
  }
  console.log('─'.repeat(38));
  const totalInserted = summary.reduce((a, s) => a + s.inserted, 0);
  const totalRecords  = summary.reduce((a, s) => a + s.records, 0);
  console.log(`${'TOTAL'.padEnd(10)} ${String(totalRecords).padStart(8)} ${String(totalInserted).padStart(9)}`);
  console.log();

  // ── Verify row counts in Supabase ────────────────────────────
  console.log('Verifying in Supabase...');
  for (const s of summary) {
    const { count } = await supabase
      .from('planet_sign_transits')
      .select('*', { count: 'exact', head: true })
      .eq('planet', s.planet);
    const ok = count === s.inserted ? '✓' : `✗ expected ${s.inserted}, got ${count}`;
    console.log(`  ${s.planet.padEnd(10)} ${String(count).padStart(4)} rows  ${ok}`);
  }

  console.log();
  await sendCompletionEmail(summary);

  console.log();
  console.log('All done. Next: start the daily positions cron.');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
