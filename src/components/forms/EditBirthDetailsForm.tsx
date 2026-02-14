'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CitySearch, type City } from '@/components/forms/CitySearch'
import { DateTimeField, type DateTimeValue } from '@/components/forms/DateTimeField'
import { parseDateTime } from '@/lib/utils/parseDateTime'
import { cn } from '@/lib/utils'

// ============================================
// VALIDATION SCHEMA
// ============================================

const editFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select gender',
  }),
  // Stored as strings for API compatibility (same as BirthDataForm)
  birthDate: z.string().min(1, 'Birth date is required'),   // YYYY-MM-DD
  birthTime: z.string().min(1, 'Birth time is required'),   // HH:MM
  timePeriod: z.enum(['AM', 'PM']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
  cityName: z.string().optional(),
})

type EditFormData = z.infer<typeof editFormSchema>

// ============================================
// COMPONENT
// ============================================

interface EditBirthDetailsFormProps {
  /** Whether form is visible */
  isOpen: boolean
  /** Current birth data */
  currentData: {
    name: string
    gender?: 'male' | 'female'
    localDateTime: string
    latitude: number
    longitude: number
    timezone: string
    cityName?: string
  }
  /** Callback when form is submitted */
  onSubmit: (data: {
    name: string
    gender: 'male' | 'female'
    birthDate: string
    birthTime: string
    timePeriod: 'AM' | 'PM'
    latitude: number
    longitude: number
    timezone: string
  }) => Promise<void>
  /** Callback to close the form */
  onCancel: () => void
  /** Additional className */
  className?: string
}

export function EditBirthDetailsForm({
  isOpen,
  currentData,
  onSubmit,
  onCancel,
  className,
}: EditBirthDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse incoming datetime into DateTimeValue for DateTimeField
  const parsed = parseDateTime(currentData.localDateTime)
  const [dateTime, setDateTime] = useState<DateTimeValue>(parsed)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: currentData.name,
      gender: currentData.gender || 'male',
      birthDate: parsed.date ? format(parsed.date, 'yyyy-MM-dd') : '',
      birthTime: parsed.hour && parsed.minute ? `${parsed.hour}:${parsed.minute}` : '',
      timePeriod: parsed.period ?? 'AM',
      latitude: currentData.latitude,
      longitude: currentData.longitude,
      timezone: currentData.timezone,
      cityName: currentData.cityName || '',
    },
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')
  const gender = watch('gender')

  // Sync DateTimeField changes → form fields (same pattern as BirthDataForm)
  const syncDateTimeToForm = (next: DateTimeValue) => {
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
  }

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setValue('latitude', city.latitude)
    setValue('longitude', city.longitude)
    setValue('timezone', city.timezone)
    setValue('cityName', city.city_name)
  }

  const handleFormSubmit = async (data: EditFormData) => {
    if (!dateTime.date || !dateTime.hour || !dateTime.minute) {
      return // DateTimeField validation will surface errors
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        timePeriod: data.timePeriod,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 md:p-6',
        'animate-slide-up',
        className,
      )}
    >
      <h3 className="text-lg font-medium mb-4">Edit Birth Details</h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name and Gender Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              {...register('name')}
              placeholder="Enter name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={gender}
              onValueChange={(v) =>
                setValue('gender', v as 'male' | 'female', { shouldValidate: true })
              }
            >
              <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-destructive">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Date + Time — reuses DateTimeField (same as home form) */}
        <DateTimeField value={dateTime} onChange={syncDateTimeToForm} disabledFuture fromYear={1900} />
        {errors.birthDate && (
          <p className="text-sm text-destructive">{errors.birthDate.message}</p>
        )}
        {errors.birthTime && (
          <p className="text-sm text-destructive">{errors.birthTime.message}</p>
        )}

        {/* Birth Place */}
        <div className="space-y-2">
          <Label>Birth Place</Label>
          <CitySearch value={currentData.cityName || ''} onSelect={handleCitySelect} />
          {latitude !== 0 && longitude !== 0 && (
            <p className="text-xs text-muted-foreground">
              Coordinates: {latitude.toFixed(4)}°{latitude >= 0 ? 'N' : 'S'},{' '}
              {longitude.toFixed(4)}°{longitude >= 0 ? 'E' : 'W'}
            </p>
          )}
        </div>

        {/* Hidden fields */}
        <input type="hidden" {...register('birthDate')} />
        <input type="hidden" {...register('birthTime')} />
        <input type="hidden" {...register('timePeriod')} />
        <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
        <input type="hidden" {...register('timezone')} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Recalculate Chart
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
