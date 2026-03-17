/**
 * Saturn Transit DB Query Helper
 *
 * Fetches Saturn sign transits from planet_sign_transits table.
 * Returns data in the same shape expected by calculator-PROFESSIONAL.ts,
 * replacing the slow calculateSaturnIngress (Swiss Ephemeris) calls.
 *
 * Performance: single Supabase query <50ms vs 10-16 minutes via ephemeris.
 *
 * @file saturnTransitDB.ts
 */

import { createClient } from '@supabase/supabase-js';

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
