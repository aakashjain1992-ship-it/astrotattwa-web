/**
 * Transit DB Query Helper
 *
 * Fetches planet sign transits from the planet_sign_transits table.
 *
 * getSaturnTransitsFromDB — used by calculator-PROFESSIONAL.ts for the
 *   lifetime Saturn transit engine. Returns full IngressRecord shape.
 *
 * getJupiterTransitsFromDB — used by periodAnalyzer.ts for Jupiter aspect
 *   calculation within a selected period. Returns a lightweight row shape
 *   (sign + date range only — sub-entries not needed for aspect checks).
 *
 * Performance: single Supabase query <50ms vs Swiss Ephemeris calls.
 *
 * @file saturnTransitDB.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { JupiterDBRow } from './period-analysis-types';

// ── Types ──────────────────────────────────────────────────────────────────────

/** Shape returned by calculateSaturnIngress — we match it exactly */
export interface IngressRecord {
  sign:                number;
  signName:            string;
  entryDate:           Date;
  exitDate:            Date;
  durationDays:        number;
  subEntries:          Date[];          // [i] = when Saturn entered sign for i-th time
  subExits:            Date[];          // [i] = when Saturn left sign after i-th entry
  retrogradeStations:  Array<unknown>;  // stub array — length drives buildRetrogradePattern
  isRetrograde:        boolean;
}

// ── Supabase client (server-side only) ────────────────────────────────────────

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars for transit DB query');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Remove sub-transit rows caused by the cron worker's year-boundary bug.
 * If row B's entry_date falls inside row A's [entry_date, exit_date],
 * row B is discarded — row A already covers the full transit.
 */
function deduplicateTransits(rows: IngressRecord[]): IngressRecord[] {
  if (rows.length <= 1) return rows;
  const keep: IngressRecord[] = [];
  for (const row of rows) {
    const isSubTransit = keep.some(
      kept =>
        row.sign === kept.sign &&
        row.entryDate > kept.entryDate &&
        row.entryDate < kept.exitDate,
    );
    if (!isSubTransit) keep.push(row);
  }
  return keep;
}

// ── Main query ─────────────────────────────────────────────────────────────────

/**
 * Fetch all Saturn transits through the given signs from the DB.
 * Returns a Map<signNumber, IngressRecord[]> sorted chronologically per sign.
 *
 * @param signs     Array of sign numbers (1–12) to fetch transits for
 * @param fromDate  Only include transits that exit after this date
 * @param toDate    Only include transits that enter before this date
 */
export async function getSaturnTransitsFromDB(
  signs: number[],
  fromDate: Date,
  toDate: Date,
): Promise<Map<number, IngressRecord[]>> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('planet_sign_transits')
    .select('sign, sign_name, entry_date, exit_date, duration_days, sub_entries, sub_exits, is_retrograde')
    .eq('planet', 'Saturn')
    .in('sign', signs)
    .lt('entry_date', toDate.toISOString())
    .gt('exit_date',  fromDate.toISOString())
    .order('entry_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch Saturn transits from DB: ${error.message}`);
  }

  const rawMap = new Map<number, IngressRecord[]>();
  for (const sign of signs) rawMap.set(sign, []);

  for (const row of data || []) {
    const entryDate = new Date(row.entry_date);
    const exitDate  = new Date(row.exit_date);

    // sub_entries — array of entry timestamps
    const rawEntries: string[] | null = row.sub_entries;
    const subEntries: Date[] = rawEntries
      ? rawEntries.map((s: string) => new Date(s)).filter(d => !isNaN(d.getTime()))
      : [entryDate];

    // sub_exits — array of departure timestamps, parallel to sub_entries
    // sub_exits[i] = when Saturn left the sign after sub_entries[i]
    // sub_exits[last] = exit_date
    const rawExits: string[] | null = row.sub_exits;
    const subExits: Date[] = rawExits && rawExits.length > 0
      ? rawExits.map((s: string) => new Date(s)).filter(d => !isNaN(d.getTime()))
      : subEntries.map(() => exitDate); // fallback for old rows without sub_exits

    // retrogradeStations stub — length drives buildRetrogradePattern:
    //   1 entry → 0 stations → single_pass
    //   2 entries → 2 stations → double_pass
    //   3 entries → 4 stations → triple_pass
    const retrogradeStations = new Array(
      Math.max(0, (subEntries.length - 1) * 2)
    ).fill({});

    rawMap.get(row.sign)?.push({
      sign:               row.sign,
      signName:           row.sign_name,
      entryDate,
      exitDate,
      durationDays:       Number(row.duration_days),
      subEntries,
      subExits,
      retrogradeStations,
      isRetrograde:       row.is_retrograde,
    });
  }

  // Deduplicate per sign — removes sub-transit rows from the year-boundary bug
  const result = new Map<number, IngressRecord[]>();
  for (const [sign, rows] of rawMap) {
    result.set(sign, deduplicateTransits(rows));
  }

  return result;
}

// ── Jupiter query ─────────────────────────────────────────────────────────────

/**
 * Fetch Jupiter sign transits overlapping a given date window.
 *
 * Used by periodAnalyzer.ts to check Jupiter's aspect on Moon and Saturn
 * during each year of a selected Sade Sati / Dhaiya period.
 *
 * Returns lightweight rows (sign + date range only).
 * Sub-entries are intentionally omitted — for aspect calculation we only
 * need which sign Jupiter occupies at any point during the window.
 *
 * Coverage: 1940–2100 (Jupiter extended via generate-planet-transits.js).
 *
 * @param fromDate  Start of the date window (period.startDate)
 * @param toDate    End of the date window (period.endDate)
 */
export async function getJupiterTransitsFromDB(
  fromDate: Date,
  toDate: Date,
): Promise<JupiterDBRow[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('planet_sign_transits')
    .select('sign, sign_name, entry_date, exit_date')
    .eq('planet', 'Jupiter')
    .lt('entry_date', toDate.toISOString())
    .gt('exit_date',  fromDate.toISOString())
    .order('entry_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch Jupiter transits from DB: ${error.message}`);
  }

  return (data || []).map(row => ({
    sign:      row.sign      as number,
    signName:  row.sign_name as string,
    entryDate: new Date(row.entry_date),
    exitDate:  new Date(row.exit_date),
  }));
}
