import { DateTime } from 'luxon'; // npm install luxon

export function convertToUTC(
  date: string,      // "1992-03-25"
  time: string,      // "11:55" (24-hour)
  timezone: string   // "Asia/Kolkata"
): {
  utcDate: string;
  utcTime: string;
  julianDay: number;
} {
  // Parse local datetime with timezone
  const localDateTime = DateTime.fromISO(`${date}T${time}`, {
    zone: timezone
  });
  
  if (!localDateTime.isValid) {
    throw new Error(`Invalid date/time: ${localDateTime.invalidReason}`);
  }
  
  // Convert to UTC
  const utcDateTime = localDateTime.toUTC();
  
  // Calculate Julian Day (for Swiss Ephemeris)
  const julianDay = utcDateTime.toJulianDate();
  
  return {
    utcDate: utcDateTime.toISODate(), // "1992-03-25"
    utcTime: utcDateTime.toFormat('HH:mm:ss'), // "06:25:00"
    julianDay: julianDay // 2448711.7673611114
  };
}
