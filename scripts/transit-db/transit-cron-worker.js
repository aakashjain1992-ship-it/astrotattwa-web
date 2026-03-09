#!/usr/bin/env node

/**
 * Astrotattwa — Planet Transit Database
 * Step 3: Saturn Sign Transit Cron Worker
 *
 * Reads one pending year from transit_generation_log, computes
 * all Saturn sign ingresses for that year (including sub-entries
 * caused by retrograde), inserts into planet_sign_transits.
 *
 * Usage:
 *   node transit-cron-worker.js
 *
 * PM2 runs this every 5 minutes. Each tick processes one year.
 * Total runtime for 1940–2100 (161 years): ~2–3 hours.
 *
 * Required env vars (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *
 * Place in: /var/www/astrotattwa-web/transit-cron-worker.js
 */

'use strict';

const path   = require('path');
const fs     = require('fs');
const { createClient } = require('@supabase/supabase-js');

// ─────────────────────────────────────────────────────────────
// 1. ENV LOADING
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

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY    = process.env.RESEND_API_KEY;
const ALERT_TO      = 'aakashjain1992@gmail.com';
const ALERT_FROM    = 'noreply@astrotattwa.com';
const SUPABASE_LINK = 'https://supabase.com/dashboard/project/ccrmlamtoxrilnhiwuwu/editor';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// 2. CLIENTS
// ─────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────────────────────
// 3. SWISS EPHEMERIS HELPERS
// Following exact patterns from src/lib/astrology/swissEph.ts
// ─────────────────────────────────────────────────────────────

let swe = null;

function getSwe() {
  if (!swe) {
    swe = require('swisseph');
    const ephePath = path.join(process.cwd(), 'public', 'ephe');
    swe.swe_set_ephe_path(ephePath);
    // Lahiri ayanamsa — standard Vedic astrology
    swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
  }
  return swe;
}

/**
 * Compute Saturn's sidereal longitude and speed at a Julian Day.
 * Returns { lon: 0–360, speed: degrees/day (negative = retrograde) }
 */
function saturnAt(jd) {
  const s   = getSwe();
  const res = s.swe_calc_ut(jd, s.SE_SATURN, s.SEFLG_SIDEREAL | s.SEFLG_SPEED);
  if (!res || typeof res.longitude !== 'number') {
    throw new Error(`swe_calc_ut failed at JD ${jd}: ${res?.error || 'unknown error'}`);
  }
  return {
    lon:   res.longitude,           // sidereal longitude 0–360°
    speed: res.longitudeSpeed ?? 0,      // degrees/day; negative = retrograde
  };
}

/**
 * Sign number (1–12) from sidereal longitude.
 */
function lonToSign(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30) + 1;
}

/**
 * UTC Date → Julian Day (noon-UTC baseline).
 */
function dateToJd(year, month, day, hour = 12) {
  const s = getSwe();
  return s.swe_julday(year, month, day, hour, s.SE_GREG_CAL);
}

/**
 * Julian Day → UTC Date object.
 * Uses the standard JD-to-Gregorian algorithm (Meeus Ch. 7).
 */
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
  const s    = Math.round((mins - m) * 60);
  return new Date(Date.UTC(yr, mon - 1, day, h, m, Math.min(s, 59)));
}

/**
 * True if the sign change from → to is in the forward (prograde) direction.
 * Zodiac order: Aries(1) → Taurus(2) → … → Pisces(12) → Aries(1).
 */
function isForward(fromSign, toSign) {
  if (fromSign === 12 && toSign === 1)  return true;   // Pisces → Aries
  if (fromSign === 1  && toSign === 12) return false;  // Aries → Pisces (retrograde)
  return toSign > fromSign;
}

/**
 * Binary search to find the exact Julian Day of a sign crossing
 * between jdLo (planet is in signAtLo) and jdHi (planet is in a different sign).
 * Returns JD to within ~1 minute (1/1440 day).
 */
function refineCrossing(jdLo, jdHi, signAtLo) {
  const precision = 1 / 1440; // 1 minute
  let lo = jdLo, hi = jdHi;
  while (hi - lo > precision) {
    const mid = (lo + hi) / 2;
    const { lon } = saturnAt(mid);
    if (lonToSign(lon) === signAtLo) lo = mid;
    else                             hi = mid;
  }
  return (lo + hi) / 2;
}

// ─────────────────────────────────────────────────────────────
// 4. TRANSIT COMPUTATION
// ─────────────────────────────────────────────────────────────

const SIGN_NAMES = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/**
 * Scan an entire calendar year for Saturn sign-entry events.
 * Returns an array of "first entry" events — each one starts a full
 * transit that buildTransitRecord() will complete.
 *
 * A "first entry" is a forward crossing into a sign that Saturn was
 * NOT in at the start of the year (Jan 1 noon UTC).
 *
 * Typically 0 or 1 event per year; occasionally 2 (rare).
 */
function findFirstEntriesInYear(year) {
  const jdStart  = dateToJd(year,     1,  1, 12);
  const jdEnd    = dateToJd(year + 1, 1,  1, 12);
  const stepDays = 1;

  const { lon: lonStart } = saturnAt(jdStart);
  const signOnJan1 = lonToSign(lonStart);

  const entries = [];
  let prevJd   = jdStart;
  let prevSign = signOnJan1;

  for (let jd = jdStart + stepDays; jd <= jdEnd; jd += stepDays) {
    const { lon } = saturnAt(jd);
    const sign    = lonToSign(lon);

    if (sign !== prevSign) {
      // Sign boundary crossed — refine to exact minute
      const crossingJd = refineCrossing(prevJd, jd, prevSign);
      const forward    = isForward(prevSign, sign);

      if (forward && sign !== signOnJan1) {
        // First forward entry into a sign we weren't in at Jan 1
        entries.push({ jd: crossingJd, sign });
      }

      prevSign = sign;
    }
    prevJd = jd;
  }

  return entries;
}

/**
 * Given the Julian Day of Saturn's first forward entry into a sign,
 * scan forward (up to 1,500 days) to build the full transit record:
 *   - All forward re-entries after retrograde (sub_entries)
 *   - The final forward exit (exit_date)
 *   - Whether any retrograde re-crossings occurred
 *
 * Saturn's transit through one sign is typically 2–3 years including
 * retrograde loops; 1,500 days (~4.1 years) safely covers all cases.
 */
function buildTransitRecord(entryJd, entrySign) {
  const subEntries        = [entryJd]; // [i] = JD when Saturn entered sign for i-th time
  const subExits          = [];        // [i] = JD when Saturn left sign after i-th entry
  let   isRetrograde      = false;
  let   lastForwardExit   = null;
  let   currentExitJd     = null;      // departure date for the currently open pass
  const maxDays           = 1500;

  let prevJd   = entryJd;
  let prevSign = entrySign;

  for (let d = 1; d <= maxDays; d++) {
    const jd      = entryJd + d;
    const { lon } = saturnAt(jd);
    const sign    = lonToSign(lon);

    if (sign !== prevSign) {
      const crossingJd = refineCrossing(prevJd, jd, prevSign);
      const forward    = isForward(prevSign, sign);

      if (prevSign === entrySign) {
        // Saturn is LEAVING entrySign — record departure for the current pass
        currentExitJd = crossingJd;

        if (forward) {
          // Forward exit — candidate for the final exit
          lastForwardExit = crossingJd;
        } else {
          // Retrograde exit — Saturn will come back
          isRetrograde = true;
        }

      } else if (sign === entrySign) {
        // Saturn is RETURNING to entrySign (after being away)
        // Close the previous pass with its recorded exit
        if (currentExitJd !== null) {
          subExits.push(currentExitJd);
          currentExitJd = null;
        }
        subEntries.push(crossingJd);
        isRetrograde    = true;
        lastForwardExit = null; // the previous exit was not final
      }

      prevSign = sign;
    }
    prevJd = jd;
  }

  if (!lastForwardExit) {
    throw new Error(
      `Could not find exit date for Saturn in ${SIGN_NAMES[entrySign]} ` +
      `(entry JD ${entryJd.toFixed(2)}). Transit may exceed 1,500 days.`
    );
  }

  // Close the last (final) pass
  subExits.push(lastForwardExit);

  // Sanity check — should always be equal
  if (subExits.length !== subEntries.length) {
    throw new Error(
      `sub_entries/sub_exits length mismatch for Saturn in ${SIGN_NAMES[entrySign]}: ` +
      `${subEntries.length} entries vs ${subExits.length} exits`
    );
  }

  const entryDate    = jdToDate(entryJd);
  const exitDate     = jdToDate(lastForwardExit);
  const durationDays = parseFloat(((lastForwardExit - entryJd)).toFixed(2));
  const retrograde   = isRetrograde || subEntries.length > 1;

  return {
    planet:        'Saturn',
    planet_id:     getSwe().SE_SATURN,
    sign:          entrySign,
    sign_name:     SIGN_NAMES[entrySign],
    entry_date:    entryDate.toISOString(),
    exit_date:     exitDate.toISOString(),
    duration_days: durationDays,
    sub_entries:   subEntries.map(jd => jdToDate(jd).toISOString()),
    sub_exits:     subExits.map(jd   => jdToDate(jd).toISOString()),
    is_retrograde: retrograde,
  };
}

/**
 * Process one year: find all new Saturn sign transits that START in
 * that year, build complete records, insert into Supabase.
 * Returns the count of rows inserted.
 */
async function processSaturnYear(year) {
  console.log(`  Computing Saturn sign entries for ${year}...`);

  const entries = findFirstEntriesInYear(year);

  if (entries.length === 0) {
    console.log(`  No new sign entries in ${year} (Saturn mid-transit).`);
    return 0;
  }

  console.log(`  Found ${entries.length} entry event(s) in ${year}. Building transit records...`);

  const rows = [];
  for (const entry of entries) {
    const entryDateStr = jdToDate(entry.jd).toISOString().slice(0, 10);
    console.log(`  Building transit: Saturn → ${SIGN_NAMES[entry.sign]} (entered ~${entryDateStr})`);
    const record = buildTransitRecord(entry.jd, entry.sign);
    rows.push(record);
    console.log(`    entry_date:    ${record.entry_date.slice(0, 16)} UTC`);
    console.log(`    exit_date:     ${record.exit_date.slice(0, 16)} UTC`);
    console.log(`    duration_days: ${record.duration_days}`);
    console.log(`    sub_entries:   ${record.sub_entries.length} entries, ${record.sub_exits.length} exits (${record.is_retrograde ? 'retrograde' : 'clean'})`);
  }

  const { data, error } = await supabase
    .from('planet_sign_transits')
    .upsert(rows, {
      onConflict:       'planet,sign,entry_date',
      ignoreDuplicates: true,
    })
    .select('id');

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);

  const inserted = data ? data.length : 0;
  console.log(`  Inserted ${inserted} row(s) (${rows.length - inserted} already existed).`);
  return inserted;
}

// ─────────────────────────────────────────────────────────────
// 5. EMAIL ALERTS (Resend HTTP API)
// ─────────────────────────────────────────────────────────────

async function sendEmail(subject, htmlBody) {
  if (!RESEND_KEY) {
    console.warn('  [email] RESEND_API_KEY not set — skipping email.');
    return;
  }
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
        subject,
        html:    htmlBody,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`  [email] Resend API error ${res.status}: ${body}`);
    } else {
      console.log(`  [email] Sent: "${subject}"`);
    }
  } catch (err) {
    console.warn(`  [email] Failed to send email: ${err.message}`);
  }
}

function emailJobError(year, attempt, errorMessage) {
  const subject  = `[Transit Cron] Job error — Saturn ${year} (attempt ${attempt}/3)`;
  const html = `
    <h2>Transit Cron Job Error</h2>
    <p><strong>Planet:</strong> Saturn<br>
    <strong>Year:</strong> ${year}<br>
    <strong>Attempt:</strong> ${attempt} of 3<br>
    <strong>Error:</strong> ${errorMessage}</p>
    <p>The cron will auto-retry on the next tick (5 minutes).</p>
    <p><a href="${SUPABASE_LINK}">View transit_generation_log in Supabase →</a></p>
  `;
  return sendEmail(subject, html);
}

function emailHardFailure(year, errors) {
  const subject = `[ACTION REQUIRED] Transit cron permanently failed — Saturn ${year}`;
  const errorList = errors.map((e, i) =>
    `<li><strong>Attempt ${i + 1}:</strong> ${e.time} — ${e.message}</li>`
  ).join('');
  const sql = `SELECT * FROM transit_generation_log WHERE planet = 'Saturn' AND period = '${year}';`;
  const html = `
    <h2 style="color:red">⚠ Transit Cron Hard Failure</h2>
    <p><strong>Planet:</strong> Saturn<br>
    <strong>Year:</strong> ${year}<br>
    <strong>Status:</strong> Permanently stopped after 3 failed attempts.</p>

    <h3>Error History</h3>
    <ol>${errorList}</ol>

    <h3>How to Manually Retry</h3>
    <ol>
      <li>Open <a href="${SUPABASE_LINK}">Supabase SQL Editor</a></li>
      <li>Run: <code>UPDATE transit_generation_log SET status = 'pending', retry_count = 0, error_message = NULL WHERE planet = 'Saturn' AND period = '${year}';</code></li>
      <li>The cron will pick it up on its next tick.</li>
    </ol>

    <h3>Diagnostic Query</h3>
    <pre>${sql}</pre>

    <hr>
    <p style="color:gray">Forward this email to your developer with subject: <em>Transit Cron Hard Failure</em></p>
  `;
  return sendEmail(subject, html);
}

async function emailPlanetComplete(totalRows) {
  const subject = `[Transit Cron] ✅ Saturn complete — ${totalRows} transits inserted`;
  const html = `
    <h2>Saturn Transit Generation Complete</h2>
    <p>All 161 years (1940–2100) have been processed.</p>
    <p><strong>Total rows in planet_sign_transits (Saturn):</strong> ~${totalRows}</p>
    <p>The Sade Sati API route can now be updated to read from the database.<br>
    Response time improvement: <strong>16 minutes → &lt;100ms</strong></p>
    <p><a href="${SUPABASE_LINK}">Verify row counts in Supabase →</a></p>
    <p><em>Next: run the one-time script for all other planets (generate-planet-transits.js).</em></p>
  `;
  return sendEmail(subject, html);
}

function emailStuckJobReset(year) {
  const subject = `[Transit Cron] Stuck job reset — Saturn ${year}`;
  const html = `
    <h2>Stuck Row Auto-Reset</h2>
    <p>A job for Saturn ${year} was stuck in <code>processing</code> for more than 10 minutes.<br>
    It has been automatically reset to <code>pending</code> and will retry on the next tick.</p>
    <p><a href="${SUPABASE_LINK}">View transit_generation_log →</a></p>
  `;
  return sendEmail(subject, html);
}

// ─────────────────────────────────────────────────────────────
// 6. CRON LOG HELPERS (transit_generation_log)
// ─────────────────────────────────────────────────────────────

/** Reset rows stuck in 'processing' for more than 10 minutes. */
async function resetStuckRows() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: stuckRows } = await supabase
    .from('transit_generation_log')
    .select('id, period')
    .eq('phase',  'sign_transits')
    .eq('planet', 'Saturn')
    .eq('status', 'processing')
    .lt('started_at', tenMinutesAgo);

  if (stuckRows && stuckRows.length > 0) {
    for (const row of stuckRows) {
      console.log(`  Resetting stuck row: Saturn ${row.period}`);
      await supabase
        .from('transit_generation_log')
        .update({ status: 'pending', started_at: null })
        .eq('id', row.id);
      await emailStuckJobReset(row.period);
    }
  }
}

/** Claim the next pending Saturn year. Returns the log row or null. */
async function claimNextPendingYear() {
  // Find oldest pending row
  const { data: rows, error } = await supabase
    .from('transit_generation_log')
    .select('*')
    .eq('phase',  'sign_transits')
    .eq('planet', 'Saturn')
    .eq('status', 'pending')
    .order('period', { ascending: true })
    .limit(1);

  if (error) throw new Error(`Failed to query pending rows: ${error.message}`);
  if (!rows || rows.length === 0) return null;

  const row = rows[0];

  // Mark as processing
  const { error: updateError } = await supabase
    .from('transit_generation_log')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', row.id);

  if (updateError) throw new Error(`Failed to claim row: ${updateError.message}`);
  return row;
}

/** Mark a log row as done. */
async function markDone(id, rowCount) {
  await supabase
    .from('transit_generation_log')
    .update({
      status:       'done',
      completed_at: new Date().toISOString(),
      row_count:    rowCount,
    })
    .eq('id', id);
}

/** Mark a log row as error; increment retry_count. */
async function markError(id, message, currentRetryCount) {
  await supabase
    .from('transit_generation_log')
    .update({
      status:        currentRetryCount + 1 >= 3 ? 'error' : 'pending',
      error_message: message,
      retry_count:   currentRetryCount + 1,
      started_at:    null,
    })
    .eq('id', id);
}

/** Check if all Saturn years are done. Returns total rows inserted if done. */
async function checkAllDone() {
  const { count: pending } = await supabase
    .from('transit_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('phase',  'sign_transits')
    .eq('planet', 'Saturn')
    .in('status', ['pending', 'processing', 'error']);

  if (pending && pending > 0) return null; // not done

  const { count: totalRows } = await supabase
    .from('planet_sign_transits')
    .select('*', { count: 'exact', head: true })
    .eq('planet', 'Saturn');

  return totalRows ?? 0;
}

// ─────────────────────────────────────────────────────────────
// 7. MAIN WORKER TICK
// ─────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('─'.repeat(60));
  console.log(`[${new Date().toISOString()}] Saturn cron tick`);

  try {
    // Step 1: Reset any stuck rows from crashed previous runs
    await resetStuckRows();

    // Step 2: Claim the next pending year
    const row = await claimNextPendingYear();

    if (!row) {
      // No pending rows — Saturn is fully done (or an error state)
      console.log('  No pending rows found.');

      const totalRows = await checkAllDone();
      if (totalRows !== null) {
        console.log(`  All Saturn years complete. Total rows: ${totalRows}`);
        console.log('  Sending Planet Complete email...');
        await emailPlanetComplete(totalRows);
        console.log('  Disable this cron in PM2: pm2 stop transit-cron-saturn');
      } else {
        console.log('  Some rows are in error state. Check transit_generation_log.');
      }
      return;
    }

    const year = parseInt(row.period, 10);
    console.log(`  Processing: Saturn ${year} (log row id=${row.id}, retry=${row.retry_count})`);

    // Step 3: Compute and insert
    let inserted = 0;
    try {
      inserted = await processSaturnYear(year);
    } catch (err) {
      const attempt = row.retry_count + 1;
      console.error(`  ERROR: ${err.message}`);

      await markError(row.id, err.message, row.retry_count);

      if (attempt >= 3) {
        // Hard failure — parse existing errors from DB for the email
        const { data: errRow } = await supabase
          .from('transit_generation_log')
          .select('error_message')
          .eq('id', row.id)
          .single();

        await emailHardFailure(year, [
          { time: new Date().toISOString(), message: err.message },
        ]);
        console.error(`  HARD FAILURE: Saturn ${year} failed 3 times. Manual intervention required.`);
      } else {
        await emailJobError(year, attempt, err.message);
        console.log(`  Will retry on next tick (attempt ${attempt}/3).`);
      }
      return;
    }

    // Step 4: Mark done
    await markDone(row.id, inserted);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Done. Saturn ${year} complete in ${elapsed}s. Rows inserted: ${inserted}`);

    // Step 5: Check if all years are now done
    const totalRows = await checkAllDone();
    if (totalRows !== null) {
      console.log(`\n  🎉 ALL Saturn years complete! Total rows: ${totalRows}`);
      await emailPlanetComplete(totalRows);
      console.log('  Run: pm2 stop transit-cron-saturn');
    }

  } catch (fatalErr) {
    // Unexpected error outside the job (e.g. Supabase connection failure)
    console.error(`  FATAL: ${fatalErr.message}`);
    console.error(fatalErr.stack);
    process.exit(1);
  }

  console.log('─'.repeat(60));
}

main();
