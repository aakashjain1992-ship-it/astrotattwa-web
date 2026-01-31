export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const yy = get("year");
  const mm = get("month");
  const dd = get("day");
  const hh = get("hour");
  const mi = get("minute");
  const ss = get("second");

  // offsetMinutes = (local - utc) in minutes
  return Math.round((Date.UTC(yy, mm - 1, dd, hh, mi, ss) - date.getTime()) / 60000);
}

export function localDateTimeToUtc(
  yy: number,
  mm: number,
  dd: number,
  hh: number,
  mi: number,
  timeZone: string
): { utc: Date; offsetMinutes: number } {
  const naiveUtcMs = Date.UTC(yy, mm - 1, dd, hh, mi, 0);
  const firstOffset = getTimezoneOffsetMinutes(new Date(naiveUtcMs), timeZone);

  let utcMs = naiveUtcMs - firstOffset * 60000;
  const secondOffset = getTimezoneOffsetMinutes(new Date(utcMs), timeZone);

  // DST boundary fix
  if (secondOffset !== firstOffset) utcMs = naiveUtcMs - secondOffset * 60000;

  return { utc: new Date(utcMs), offsetMinutes: secondOffset };
}

/**
 * Convert 12-hour format to 24-hour format
 * @param time12 - Time in HH:MM format (12-hour)
 * @param period - "AM" or "PM"
 * @returns Time in HH:MM format (24-hour)
 *
 * Examples:
 * - convert12to24("11:55", "AM") → "11:55" (11:55 AM)
 * - convert12to24("11:55", "PM") → "23:55" (11:55 PM)
 * - convert12to24("12:00", "AM") → "00:00" (midnight)
 * - convert12to24("12:30", "PM") → "12:30" (noon)
 */
export function convert12to24(time12: string, period: "AM" | "PM"): string {
  const [hh12, mi] = time12.split(":").map(Number);
  
  if (hh12 < 1 || hh12 > 12) {
    throw new Error("Hour must be between 1 and 12 for 12-hour format");
  }
  
  let hh24: number;
  
  if (period === "AM") {
    // 12:XX AM → 00:XX (midnight hour)
    // 1-11 AM → same (1-11)
    hh24 = hh12 === 12 ? 0 : hh12;
  } else {
    // 12:XX PM → 12:XX (noon hour)
    // 1-11 PM → add 12 (13-23)
    hh24 = hh12 === 12 ? 12 : hh12 + 12;
  }
  
  return `${hh24.toString().padStart(2, "0")}:${mi.toString().padStart(2, "0")}`;
}


export function parseBirth(birthDate: string, birthTime: string) {
  const [yy, mm, dd] = birthDate.split("-").map(Number);
  const [hh, mi] = birthTime.split(":").map(Number);
  if (!yy || !mm || !dd || hh === undefined || mi === undefined) throw new Error("Invalid birthDate/birthTime format");
  return { yy, mm, dd, hh, mi };
}
