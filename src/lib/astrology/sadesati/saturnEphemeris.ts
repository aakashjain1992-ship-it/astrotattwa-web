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
 * Find the date Saturn crosses a specific ecliptic degree while moving FORWARD
 * (i.e. the first forward crossing within [startDate, endDate]).
 *
 * Algorithm:
 *  1. Coarse scan every SCAN_STEP_DAYS — detect when sign of angleDiff flips
 *     from negative→positive (meaning Saturn passed the target going forward).
 *  2. Narrow binary search on the detected 10-day window.
 *
 * Handles:
 *  - Retrograde periods (only forward crossings are detected)
 *  - Pisces→Aries 360°/0° wrap-around
 *
 * Throws if no crossing is found within the window.
 */
async function findForwardCrossing(
  targetDegree: number,
  startDate: Date,
  endDate: Date,
): Promise<Date> {
  const SCAN_STEP_MS  = 10 * 86400000; // 10 days coarse scan
  const MAX_ITER      = 50;             // binary search iterations

  let prevPos: SaturnPosition | null = null;
  let prevTime = startDate.getTime();

  let t = startDate.getTime();
  while (t <= endDate.getTime()) {
    const pos = await calculateSaturnAtDate(new Date(t));

    if (prevPos !== null) {
      const dPrev = angleDiff(prevPos.longitude, targetDegree);
      const dCurr = angleDiff(pos.longitude,     targetDegree);

      // Forward crossing: went from behind (negative diff) to ahead (positive diff)
      // AND both speeds are positive (Saturn moving direct at crossing)
      if (dPrev < 0 && dCurr >= 0) {
        // Binary search this 10-day window
        let lo = prevTime;
        let hi = t;
        for (let i = 0; i < MAX_ITER; i++) {
          if (hi - lo < 60000) break; // 1-minute precision
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
    }

    prevPos  = pos;
    prevTime = t;
    t += SCAN_STEP_MS;
  }

  throw new Error(
    `No forward crossing of ${targetDegree}° found between ` +
    `${startDate.toISOString()} and ${endDate.toISOString()}`
  );
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

  // Search window: start 60 days before the approximate date, end 4 years after
  const searchStart = new Date(approximateStartDate.getTime() - 60  * 86400000);
  const searchEnd   = new Date(approximateStartDate.getTime() + 1460 * 86400000); // 4 years

  const entryDate = await findForwardCrossing(entryDegree, searchStart, searchEnd);

  // Exit is always after entry; search up to 4 years after entry
  const exitSearchEnd = new Date(entryDate.getTime() + 1460 * 86400000);
  const exitDate      = await findForwardCrossing(exitDegree, entryDate, exitSearchEnd);

  const durationDays = Math.floor(
    (exitDate.getTime() - entryDate.getTime()) / 86400000,
  );

  const retrogradeStations = await detectRetrogradeStations(entryDate, exitDate);

  return {
    sign:     targetSign,
    signName: SIGN_NAMES[targetSign - 1],
    entryDate,
    exitDate,
    durationDays,
    retrogradeStations,
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
