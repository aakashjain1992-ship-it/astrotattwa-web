'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { UseFormSetValue } from 'react-hook-form'
import type { DateTimeValue } from '@/components/forms/DateTimeField'

// Minimal type: any form that has these three fields can use this hook
type DateTimeFormFields = {
  birthDate: string
  birthTime: string
  timePeriod: 'AM' | 'PM'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Shared hook for managing DateTimeField state and syncing it into
 * a react-hook-form instance.
 *
 * Used by: BirthDataForm, EditBirthDetailsForm
 */
export function useDateTimeSync(
  setValue: UseFormSetValue<DateTimeFormFields>,
  initialValue?: DateTimeValue,
) {
  const [dateTime, setDateTime] = useState<DateTimeValue>(
    initialValue ?? { date: undefined, hour: undefined, minute: undefined, period: 'AM' },
  )

  const syncDateTimeToForm = useCallback(
    (next: DateTimeValue) => {
      setDateTime(next)

      if (next.date) {
        setValue('birthDate', format(next.date, 'yyyy-MM-dd'), { shouldValidate: true })
      } else {
        setValue('birthDate', '', { shouldValidate: true })
      }

      if (next.hour && next.minute) {
        setValue('birthTime', `${next.hour}:${next.minute}`, { shouldValidate: true })
      } else {
        setValue('birthTime', '', { shouldValidate: true })
      }

      if (next.period) {
        setValue('timePeriod', next.period, { shouldValidate: true })
      }
    },
    [setValue],
  )

  return { dateTime, setDateTime, syncDateTimeToForm }
}
