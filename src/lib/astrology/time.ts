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

export function parseBirth(birthDate: string, birthTime: string) {
  const [yy, mm, dd] = birthDate.split("-").map(Number);
  const [hh, mi] = birthTime.split(":").map(Number);
  if (!yy || !mm || !dd || hh === undefined || mi === undefined) throw new Error("Invalid birthDate/birthTime format");
  return { yy, mm, dd, hh, mi };
}
