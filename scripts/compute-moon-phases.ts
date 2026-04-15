/**
 * compute-moon-phases.ts
 *
 * Computes exact tithi_start and tithi_end timestamps for ALL records in
 * festival_calendar using Swiss Ephemeris binary search.
 *
 * Every tithi is a 12° window of Moon-Sun tropical elongation:
 *   Tithi N starts at (N-1)*12°  and ends at N*12°  (N = 1–30)
 *
 * For each festival, we:
 *   1. Compute elongation at ~6 AM IST (00:30 UTC) on the festival date
 *      (traditional tithi is determined at sunrise)
 *   2. Derive the active tithi's start and end angles
 *   3. Binary-search for the exact UTC crossing times
 *
 * Run: npx tsx scripts/compute-moon-phases.ts
 */

import path from 'path'
import { createClient } from '@supabase/supabase-js'
import swe from 'swisseph'

// ── Supabase ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Swiss Ephemeris setup (tropical) ─────────────────────────────────────────

function initSwe() {
  const ephePath = path.join(process.cwd(), 'public', 'ephe')
  ;(swe as any).swe_set_ephe_path(ephePath)
  // No swe_set_sid_mode → tropical positions
}

/** Date → Julian Day (UTC) */
function dateToJD(s: any, date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  return s.swe_julday(y, m, d, h, s.SE_GREG_CAL)
}

/** Julian Day (UTC) → Date */
function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000)
}

/** Tropical longitude of a body at JD (UTC) */
function tropicalLon(s: any, jdUt: number, body: number): number {
  const flags = s.SEFLG_SWIEPH  // tropical (no SEFLG_SIDEREAL)
  const res = s.swe_calc_ut(jdUt, body, flags)
  if (typeof res.longitude === 'number') return res.longitude
  if (Array.isArray(res.data) && typeof res.data[0] === 'number') return res.data[0]
  throw new Error(`swe_calc_ut failed: ${res.error ?? 'unknown'}`)
}

/**
 * Moon-Sun elongation (0–360°).
 * Increases monotonically (Moon moves ~12–13°/day faster than Sun).
 * 0° = new moon, 180° = full moon.
 */
function elongation(s: any, jdUt: number): number {
  const moonLon = tropicalLon(s, jdUt, s.SE_MOON)
  const sunLon  = tropicalLon(s, jdUt, s.SE_SUN)
  let diff = moonLon - sunLon
  if (diff < 0) diff += 360
  return diff
}

/**
 * Binary search for the JD when elongation crosses `angle` degrees.
 * targetFn returns negative before the crossing, positive after.
 * Since elongation is monotonically increasing, we advance lo when
 * targetFn < 0 (not yet reached target) and retract hi otherwise.
 */
function binarySearch(
  s: any,
  jdLow: number,
  jdHigh: number,
  targetFn: (jd: number) => number,
  precision = 0.0005  // ~43 seconds in JD
): number {
  let lo = jdLow
  let hi = jdHigh
  for (let i = 0; i < 60; i++) {
    if (hi - lo < precision) break
    const mid = (lo + hi) / 2
    if (targetFn(mid) < 0) lo = mid  // not yet reached — advance lower bound
    else hi = mid                     // at or past crossing — retract upper bound
  }
  return (lo + hi) / 2
}

/**
 * Find the exact JD when elongation crosses `angle` degrees,
 * searching within ±2.5 days of noon on the given date string.
 *
 * Uses normalized diff = elongation(jd) - angle mapped to (-180°, +180°]
 * so the 360°/0° wrap for Amavasya end (angle=360) is handled correctly.
 */
function findCrossing(s: any, dateStr: string, angle: number): number {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const noonUTC  = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0))
  const jdApprox = dateToJD(s, noonUTC)
  const jdLow    = jdApprox - 2.5
  const jdHigh   = jdApprox + 2.5

  const targetFn = (jd: number) => {
    let diff = elongation(s, jd) - angle
    // Normalize to (-180, +180] — handles 360°/0° wrap for amavasya end
    if (diff >  180) diff -= 360
    if (diff < -180) diff += 360
    return diff  // negative = before crossing, positive = after
  }

  return binarySearch(s, jdLow, jdHigh, targetFn)
}

/** Tithi name lookup (1-indexed) */
const TITHI_NAMES = [
  '', // 1-indexed
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
]
const PAKSHA = ['Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla','Shukla',
                'Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna','Krishna']

/** Convert IST display */
function toIST(iso: string): string {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + 330)
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' IST'
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  initSwe()
  const s = swe as any

  // Fetch ALL festival records
  const { data: rows, error } = await supabase
    .from('festival_calendar')
    .select('id, date, name, type')
    .order('date')

  if (error) { console.error('Fetch error:', error.message); process.exit(1) }
  if (!rows?.length) { console.log('No festival rows found.'); process.exit(0) }

  console.log(`Computing tithi windows for ${rows.length} festival records…\n`)
  console.log('  St  Date        Festival                         Tithi                  Start (IST)        End (IST)')
  console.log('  --  ----------  -------------------------------  ---------------------  -----------------  -----------------')

  let updated = 0
  let failed  = 0

  for (const row of rows) {
    try {
      // Determine active tithi at ~6 AM IST (00:30 UTC) — traditional Hindu sunrise time
      const [y, mo, d] = row.date.split('-').map(Number)
      const sunriseUTC  = new Date(Date.UTC(y, mo - 1, d, 0, 30, 0))
      const jdSunrise   = dateToJD(s, sunriseUTC)
      const elongSunrise = elongation(s, jdSunrise)

      // Tithi index: 0–29, where 0=Shukla Pratipada, 14=Purnima, 29=Amavasya
      const tithiIndex = Math.floor(elongSunrise / 12)
      const startAngle = tithiIndex * 12        // e.g. 168 for Purnima
      const endAngle   = (tithiIndex + 1) * 12  // e.g. 180 for Purnima; 360 for Amavasya

      const startJD = findCrossing(s, row.date, startAngle)
      const endJD   = findCrossing(s, row.date, endAngle)

      const tithi_start = jdToDate(startJD).toISOString()
      const tithi_end   = jdToDate(endJD).toISOString()

      // Sanity: end must be after start, and window ≤ 30 hours
      const durationHrs = (endJD - startJD) * 24
      if (endJD <= startJD || durationHrs > 30) {
        console.warn(`  ⚠  ${row.date}  ${row.name}: suspicious — ${durationHrs.toFixed(1)}h window`)
      }

      const tithi_number = tithiIndex + 1  // 1–30

      const { error: updateErr } = await supabase
        .from('festival_calendar')
        .update({ tithi_start, tithi_end, tithi_number })
        .eq('id', row.id)

      if (updateErr) {
        console.error(`  ✗  ${row.date}  ${row.name}: ${updateErr.message}`)
        failed++
      } else {
        const tithiLabel  = `${PAKSHA[tithiIndex]} ${TITHI_NAMES[tithi_number]} (${tithi_number})`
        console.log(
          `  ✓  ${row.date}  ${row.name.padEnd(31)}  ${tithiLabel.padEnd(21)}  ${toIST(tithi_start)}  →  ${toIST(tithi_end)}`
        )
        updated++
      }
    } catch (err: any) {
      console.error(`  ✗  ${row.date}  ${row.name}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone. Updated: ${updated}  Failed: ${failed}`)
}

main().catch(err => { console.error(err); process.exit(1) })
