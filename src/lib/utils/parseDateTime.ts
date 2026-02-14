import type { DateTimeValue } from '@/components/forms/DateTimeField'

/**
 * Parse a localDateTime string (ISO or "YYYY-MM-DD HH:mm") into
 * discrete DateTimeValue fields for use with DateTimeField component.
 *
 * Handles:
 *  - ISO strings: "1992-03-25T11:55:00"
 *  - Space-separated: "1992-03-25 11:55"
 *  - Date-only: "1992-03-25"
 */
export function parseDateTime(localDateTime: string): DateTimeValue {
  // Try native Date parse first
  try {
    const dateObj = new Date(localDateTime)
    if (!isNaN(dateObj.getTime())) {
      let hour = dateObj.getHours()
      const minute = dateObj.getMinutes()
      const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM'

      if (hour === 0) hour = 12
      else if (hour > 12) hour -= 12

      return {
        date: dateObj,
        hour: String(hour).padStart(2, '0'),
        minute: String(minute).padStart(2, '0'),
        period,
      }
    }
  } catch {
    // fall through to manual parse
  }

  // Manual parse for "YYYY-MM-DD HH:mm" or "YYYY-MM-DDTHH:mm"
  const separator = localDateTime.includes('T') ? 'T' : ' '
  const [dateStr, timeStr] = localDateTime.split(separator)

  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    let hour = 12
    let minute = 0
    let period: 'AM' | 'PM' = 'PM'

    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number)
      hour = h
      minute = m || 0
      period = hour >= 12 ? 'PM' : 'AM'
      if (hour === 0) hour = 12
      else if (hour > 12) hour -= 12
    }

    return {
      date,
      hour: String(hour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      period,
    }
  }

  // Fallback
  return { date: undefined, hour: '12', minute: '00', period: 'PM' }
}
