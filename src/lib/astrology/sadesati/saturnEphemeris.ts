/**
 * Saturn Ephemeris Service
 *
 * Calculates Saturn's actual position at any date using Swiss Ephemeris
 * and finds exact sign ingress/egress dates.
 *
 * @file saturnEphemeris.ts
 * @version 3.0.0
 * @changelog
 *   v3.0.0 - Replaced broken binary-search findSaturnAtDegree with robust
 *            forward-scan + narrow binary-search approach.
 *            Fixed retrograde motion handling and Pisces→Aries wrap-around.
 *            Reduced retrograde station detection from ~130 to ~12 calls/transit.
 */

import { sweCalcSidereal, sweJuldayUTC, getBodyIds } from "@/lib/astrology/swissEph";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaturnPosition {
  date: Date;
  longitude: number;
  sign: number;
  degreeInSign: number;
  isRetrograde: boolean;
  speed: number;
}

export interface SaturnIngress {
  sign: number;
  signName: string;
  entryDate: Date;
  exitDate: Date;
  durationDays: number;
  retrogradeStations?: RetrogradeStation[];
}

export interface RetrogradeStation {
  date: Date;
  type: 'station_retrograde' | 'station_direct';
  degree: number;
}

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ─── Core position calculator ─────────────────────────────────────────────────

/**
 * Calculate Saturn's sidereal position at a specific date.
 */
export async function calculateSaturnAtDate(date: Date): Promise<SaturnPosition> {
  const bodies = await getBodyIds();
  const jdUt   = await sweJuldayUTC(date);
  const result = await sweCalcSidereal(jdUt, bodies.SATURN);

  const sign        = Math.floor(result.lon / 30) + 1;
  const degreeInSign = result.lon % 30;

  return {
    date,
    longitude: result.lon,
    sign,
    degreeInSign,
    isRetrograde: result.speed < 0,
    speed: result.speed,
  };
}

// ─── Degree crossing finder ───────────────────────────────────────────────────

/**
 * Angular difference accounting for 360° wrap-around.
 * Returns a value in (-180, 180].
 */
function angleDiff(a: number, b: number): number {
  let d = a - b;
  while (d >  180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

/**
 * Find the date Saturn makes its first FORWARD crossing of targetDegree
 * within [startDate, endDate].
 *
 * Three-phase approach:
 *   1. 30-day coarse scan  — locates the ~30-day window (max ~365 calls/30yr window)
 *   2. 10-day fine scan    — narrows to ~10-day bracket (~3 calls)
 *   3. Binary search       — minute-level precision (~50 calls)
 *
 * Total: ~418 ephemeris calls per ingress vs 10-day-only scan's ~1095.
 * Handles retrograde and Pisces→Aries wrap-around correctly.
 */
async function findForwardCrossing(
  targetDegree: number,
  startDate: Date,
  endDate: Date,
): Promise<Date> {
  const COARSE_MS = 30 * 86400000; // 30-day coarse scan
  const FINE_MS   = 10 * 86400000; // 10-day fine scan
  const MAX_ITER  = 50;             // binary search iterations

  // ── Phase 1: 30-day coarse scan to find the crossing window ───────────────
  let prevPos: SaturnPosition | null = null;
  let prevTime = startDate.getTime();
  let coarseLo = -1;
  let coarseHi = -1;

  for (let t = startDate.getTime(); t <= endDate.getTime(); t += COARSE_MS) {
    const pos = await calculateSaturnAtDate(new Date(t));
    if (prevPos !== null) {
      const dPrev = angleDiff(prevPos.longitude, targetDegree);
      const dCurr = angleDiff(pos.longitude,     targetDegree);
      if (dPrev < 0 && dCurr >= 0) {
        coarseLo = prevTime;
        coarseHi = t;
        break;
      }
    }
    prevPos  = pos;
    prevTime = t;
  }

  if (coarseLo < 0) {
    throw new Error(
      `No forward crossing of ${targetDegree}\u00b0 found between ` +
      `${startDate.toISOString()} and ${endDate.toISOString()}`
    );
  }

  // ── Phase 2: 10-day fine scan within the 30-day coarse window ─────────────
  let fineLo = coarseLo;
  let fineHi = coarseHi;
  prevPos  = null;
  prevTime = coarseLo;

  for (let t = coarseLo; t <= coarseHi; t += FINE_MS) {
    const pos = await calculateSaturnAtDate(new Date(t));
    if (prevPos !== null) {
      const dPrev = angleDiff(prevPos.longitude, targetDegree);
      const dCurr = angleDiff(pos.longitude,     targetDegree);
      if (dPrev < 0 && dCurr >= 0) {
        fineLo = prevTime;
        fineHi = t;
        break;
      }
    }
    prevPos  = pos;
    prevTime = t;
  }

  // ── Phase 3: binary search for minute-level precision ─────────────────────
  let lo = fineLo;
  let hi = fineHi;
  for (let i = 0; i < MAX_ITER; i++) {
    if (hi - lo < 60000) break;
    const mid    = Math.floor((lo + hi) / 2);
    const midPos = await calculateSaturnAtDate(new Date(mid));
    if (angleDiff(midPos.longitude, targetDegree) < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return new Date(Math.floor((lo + hi) / 2));
}
/**
 * Find the LAST forward crossing of targetDegree within [startDate, endDate].
 * Used for sign EXIT crossings — Saturn may briefly touch the exit degree during
 * retrograde then pull back. We want the final definitive forward crossing.
 *
 * Scans the full window in 10-day steps, records ALL forward crossings, returns
 * the last one (= the true exit when Saturn leaves the sign permanently).
 */
async function findLastForwardCrossing(
  targetDegree: number,
  startDate: Date,
  endDate: Date,
): Promise<Date> {
  const STEP_MS  = 10 * 86400000;
  const MAX_ITER = 50;

  let prevPos: SaturnPosition | null = null;
  let prevTime = startDate.getTime();

  // Collect ALL forward crossings
  const crossings: number[] = [];

  for (let t = startDate.getTime(); t <= endDate.getTime(); t += STEP_MS) {
    const pos = await calculateSaturnAtDate(new Date(t));
    if (prevPos !== null) {
      const dPrev = angleDiff(prevPos.longitude, targetDegree);
      const dCurr = angleDiff(pos.longitude,     targetDegree);
      if (dPrev < 0 && dCurr >= 0) {
        // Binary search this 10-day window for precision
        let lo = prevTime, hi = t;
        for (let i = 0; i < MAX_ITER; i++) {
          if (hi - lo < 60000) break;
          const mid    = Math.floor((lo + hi) / 2);
          const midPos = await calculateSaturnAtDate(new Date(mid));
          if (angleDiff(midPos.longitude, targetDegree) < 0) lo = mid;
          else hi = mid;
        }
        crossings.push(Math.floor((lo + hi) / 2));
      }
    }
    prevPos  = pos;
    prevTime = t;
  }

  if (crossings.length === 0) {
    throw new Error(
      `No forward crossing of ${targetDegree}\u00b0 found between ` +
      `${startDate.toISOString()} and ${endDate.toISOString()}`
    );
  }

  // Return the LAST crossing = true sign exit
  return new Date(crossings[crossings.length - 1]);
}


/**
 * Detect all forward crossings of entryDegree within [entryDate, exitDate].
 * Returns the actual sign re-entry dates — used for the pass columns in the
 * reference table (1st Entry, Re-entry, Final Entry).
 *
 * Saturn may cross the sign boundary 1-3 times total during a transit due to
 * retrograde motion. Each crossing is one "pass" column.
 */
async function detectSubEntries(
  entryDegree: number,
  entryDate: Date,
  exitDate: Date,
): Promise<Date[]> {
  // Start slightly after entryDate to avoid immediately re-detecting the entry
  const scanStart = new Date(entryDate.getTime() + 2 * 86400000);
  const STEP_MS   = 10 * 86400000;
  const MAX_ITER  = 50;

  const entries: Date[] = [entryDate]; // first entry is always entryDate

  let prevPos: SaturnPosition | null = null;
  let prevTime = scanStart.getTime();

  for (let t = scanStart.getTime(); t <= exitDate.getTime(); t += STEP_MS) {
    const pos = await calculateSaturnAtDate(new Date(t));
    if (prevPos !== null) {
      const dPrev = angleDiff(prevPos.longitude, entryDegree);
      const dCurr = angleDiff(pos.longitude,     entryDegree);
      if (dPrev < 0 && dCurr >= 0) {
        let lo = prevTime, hi = t;
        for (let i = 0; i < MAX_ITER; i++) {
          if (hi - lo < 60000) break;
          const mid    = Math.floor((lo + hi) / 2);
          const midPos = await calculateSaturnAtDate(new Date(mid));
          if (angleDiff(midPos.longitude, entryDegree) < 0) lo = mid;
          else hi = mid;
        }
        entries.push(new Date(Math.floor((lo + hi) / 2)));
        if (entries.length >= 3) break; // max 3 passes
      }
    }
    prevPos  = pos;
    prevTime = t;
  }

  return entries;
}

// ─── Sign ingress calculator ──────────────────────────────────────────────────

/**
 * Calculate exact Saturn ingress dates for a sign.
 *
 * approximateStartDate: a date known to be BEFORE the expected ingress.
 * The function searches up to 4 years forward from there.
 *
 * Accounts for retrograde motion — only the first forward entry is returned.
 */
export async function calculateSaturnIngress(
  targetSign: number,
  approximateStartDate: Date,
): Promise<SaturnIngress> {
  const entryDegree = (targetSign - 1) * 30;       // 0° of sign
  const exitDegree  = (targetSign % 12) * 30;       // 0° of next sign (handles Pisces→Aries as 0°)

  // Search window: cursor → +30 years (full Saturn orbit).
  // NO lookback — caller always advances cursor past previous exit, so going
  // back in time would re-discover the same ingress on every iteration.
  const searchStart = new Date(approximateStartDate.getTime());
  const searchEnd   = new Date(approximateStartDate.getTime() + 30 * 365.25 * 86400000);

  const entryDate = await findForwardCrossing(entryDegree, searchStart, searchEnd);

  // Exit: Saturn spends 2-3 years per sign. Use fine scan (10-day steps) since
  // the window is small — 30-day coarse scan can miss short spans like Leo (30°).
  const exitSearchEnd = new Date(entryDate.getTime() + 5 * 365.25 * 86400000);
  const exitDate      = await findLastForwardCrossing(exitDegree, entryDate, exitSearchEnd);

  const durationDays = Math.floor(
    (exitDate.getTime() - entryDate.getTime()) / 86400000,
  );

  const retrogradeStations = await detectRetrogradeStations(entryDate, exitDate);

  // Detect actual sign re-entries (all forward crossings of entryDegree within transit).
  // subEntries[0] = first entry, [1] = re-entry after retrograde, [2] = final entry.
  // These are the correct dates for the 3 columns shown in the reference table.
  const subEntries = await detectSubEntries(entryDegree, entryDate, exitDate);

  return {
    sign:     targetSign,
    signName: SIGN_NAMES[targetSign - 1],
    entryDate,
    exitDate,
    durationDays,
    retrogradeStations,
    subEntries,   // actual re-entry dates for pass columns
  };
}

// ─── Retrograde station detector ─────────────────────────────────────────────

/**
 * Detect retrograde stations (SR and SD) within a transit period.
 *
 * Samples every 30 days (coarse), then narrows each detected sign-change
 * with a 7-day fine scan. Reduces calls from ~130 to ~12 per transit.
 */
async function detectRetrogradeStations(
  startDate: Date,
  endDate: Date,
): Promise<RetrogradeStation[]> {
  const stations: RetrogradeStation[] = [];
  const COARSE_STEP_MS = 30 * 86400000;
  const FINE_STEP_MS   =  7 * 86400000;

  let t    = startDate.getTime();
  let prevSpeed: number | null = null;
  let prevTime: number         = t;

  // Coarse scan
  while (t <= endDate.getTime()) {
    const pos = await calculateSaturnAtDate(new Date(t));

    if (prevSpeed !== null) {
      const crossedZero =
        (prevSpeed > 0 && pos.speed < 0) ||
        (prevSpeed < 0 && pos.speed > 0);

      if (crossedZero) {
        // Fine scan the 30-day window to pin down the station
        let ft    = prevTime;
        let fPrev = prevSpeed;
        while (ft <= t) {
          const fp = await calculateSaturnAtDate(new Date(ft));
          if (
            (fPrev  > 0 && fp.speed < 0) ||
            (fPrev  < 0 && fp.speed > 0)
          ) {
            stations.push({
              date:  new Date(ft),
              type:  fp.speed < 0 ? 'station_retrograde' : 'station_direct',
              degree: fp.degreeInSign,
            });
            break;
          }
          fPrev = fp.speed;
          ft   += FINE_STEP_MS;
        }
      }
    }

    prevSpeed = pos.speed;
    prevTime  = t;
    t        += COARSE_STEP_MS;
  }

  return stations;
}

// ─── Public utilities ─────────────────────────────────────────────────────────

export async function getCurrentSaturnTransit(): Promise<SaturnPosition> {
  return calculateSaturnAtDate(new Date());
}

/**
 * Calculate all Saturn ingresses for a person's lifetime (birth → birth+100yr).
 * Kept for backward compatibility; the main calculator uses getAllIngressesForSign.
 */
export async function calculateLifetimeSaturnIngresses(
  birthDate: Date,
): Promise<SaturnIngress[]> {
  const ingresses: SaturnIngress[] = [];
  const birthSaturn = await calculateSaturnAtDate(birthDate);

  let currentDate = new Date(birthDate);
  let currentSign = birthSaturn.sign;

  for (let i = 0; i < 40; i++) {
    try {
      const nextSign = (currentSign % 12) + 1;
      const ingress  = await calculateSaturnIngress(nextSign, currentDate);
      ingresses.push(ingress);

      currentDate = ingress.exitDate;
      currentSign = nextSign;

      const age =
        (currentDate.getTime() - birthDate.getTime()) / (86400000 * 365.25);
      if (age > 100) break;
    } catch {
      break;
    }
  }

  return ingresses;
}

/**
 * Find Saturn peak activation window (±5° of Moon degree).
 * Used by the Analysis tab only; disabled in the main API route options.
 */
export async function findSaturnPeakWindow(
  moonDegree: number,
  searchStartDate: Date,
  searchEndDate: Date,
): Promise<{ peakStart: Date; peakEnd: Date } | null> {
  const peakStartDegree = (moonDegree - 5 + 360) % 360;
  const peakEndDegree   = (moonDegree + 5)        % 360;

  try {
    const peakStart = await findForwardCrossing(peakStartDegree, searchStartDate, searchEndDate);
    const peakEnd   = await findForwardCrossing(peakEndDegree,   peakStart,       searchEndDate);
    return { peakStart, peakEnd };
  } catch {
    return null;
  }
}

/**
 * @deprecated Use findForwardCrossing instead.
 * Kept only to avoid breaking any external callers.
 */
export async function findSaturnAtDegree(
  targetDegree: number,
  startDate: Date,
  endDate: Date,
): Promise<Date> {
  return findForwardCrossing(targetDegree, startDate, endDate);
}
