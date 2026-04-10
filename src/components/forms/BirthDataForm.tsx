'use client'

import { useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { baseBirthSchema } from '@/lib/validation/birthFormSchemas'
import { format as formatDate } from 'date-fns'
import { useDateTimeSync } from '@/hooks/useDateTimeSync'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, User } from 'lucide-react'
import { CitySearch } from './CitySearch'
import { DateTimeField } from './DateTimeField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ChartFormValues } from './BirthDataFormWrapper'
import type { SavedChart } from '@/hooks/useSavedCharts'

// Extend the shared base schema with city-specific fields
const birthDataSchema = baseBirthSchema.extend({
  stateName: z.string().optional(),
})

type BirthDataFormValues = z.infer<typeof birthDataSchema>

interface Props {
  cardError?: string
  onSubmit: (values: ChartFormValues) => void
  showSavedCharts?: boolean
  savedCharts?: SavedChart[]
}

/** Convert 24h "HH:MM" (from DB) to { hour, minute, period } for DateTimeField */
function parse24hTime(time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return {
    hour: String(h12).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    period,
  }
}

export function BirthDataForm({
  onSubmit,
  cardError,
  showSavedCharts = false,
  savedCharts = [],
}: Props) {
  const [coordsError, setCoordsError] = useState(false)

  // Coordinates + timezone stored outside form state (set by CitySearch or pre-fill)
  const coordsRef = useRef<{ lat: number; lng: number; timezone: string } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitted },
  } = useForm<BirthDataFormValues>({
    resolver: zodResolver(birthDataSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name:      '',
      gender:    'Male',
      birthDate: '',
      birthTime: '',
      timePeriod:'AM',
      cityName:  '',
      latitude:  0,
      longitude: 0,
      timezone:  'Asia/Kolkata',
    },
  })

  const { dateTime, syncDateTimeToForm } = useDateTimeSync(setValue)

  const cityName = watch('cityName')

  const canBuildDateTime = useMemo(
    () => !!dateTime.date && !!dateTime.hour && !!dateTime.minute && !!dateTime.period,
    [dateTime],
  )

  // ── Pre-fill from saved chart ───────────────────────────────────
  const handleSelectSavedChart = (chartId: string) => {
    const chart = savedCharts.find(c => c.id === chartId)
    if (!chart) return

    // Capitalise gender: 'male' → 'Male'
    const gender = chart.gender
      ? chart.gender.charAt(0).toUpperCase() + chart.gender.slice(1).toLowerCase()
      : 'Male'

    // Parse birth_date "YYYY-MM-DD" into a Date object
    const [year, month, day] = chart.birth_date.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    // Convert DB 24h time → 12h + period for DateTimeField
    const { hour, minute, period } = parse24hTime(chart.birth_time)

    // Sync date + time into both form state and react-hook-form hidden fields
    syncDateTimeToForm({ date, hour, minute, period })

    setValue('name', chart.name)
    setValue('gender', gender)
    setValue('cityName', chart.birth_place)

    // Store coords for submission
    coordsRef.current = {
      lat: chart.latitude,
      lng: chart.longitude,
      timezone: chart.timezone,
    }
    setCoordsError(false)
  }

  // ── City select ─────────────────────────────────────────────────
  const handleCitySelect = (city: {
    id: number
    city_name: string
    state_name: string
    latitude: number
    longitude: number
    timezone: string
  }) => {
    setValue('cityName', `${city.city_name}, ${city.state_name}`)
    coordsRef.current = { lat: city.latitude, lng: city.longitude, timezone: city.timezone }
    setCoordsError(false)
  }

  // ── Submit ──────────────────────────────────────────────────────
  const onValid = (data: BirthDataFormValues) => {
    if (!canBuildDateTime) {
      alert('Please select a valid birth date and time.')
      return
    }
    if (!coordsRef.current) {
      setCoordsError(true)
      return
    }
    onSubmit({
      name:       data.name,
      gender:     data.gender,
      birthDate:  data.birthDate,
      birthTime:  data.birthTime,
      timePeriod: data.timePeriod,
      birthPlace: data.cityName,
      latitude:   coordsRef.current.lat,
      longitude:  coordsRef.current.lng,
      timezone:   coordsRef.current.timezone,
    })
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-6">

      {/* Card header: title + saved chart dropdown inline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontFamily: "FangSong, STFangSong, fangsong, Georgia, serif", fontSize: '26px', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.2 }}>
            Check your Kundli
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text3)', margin: 0 }}>
            Enter your birth details to see your chart
          </p>
        </div>

        {/* Saved charts dropdown — only for logged-in users who have saved charts */}
        {showSavedCharts && savedCharts.length > 0 && (
          <div style={{ flexShrink: 0, marginTop: '4px', width: '180px' }}>
            <Select onValueChange={handleSelectSavedChart}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="My Charts" />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh] overflow-y-auto">
                {savedCharts.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.is_favorite ? '★ ' : ''}{c.label ? `${c.name} (${c.label})` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </Label>
        <Input
          id="name"
          placeholder="e.g., Priya Sharma"
          autoComplete="given-name"
          {...register('name')}
          className={errors.name ? 'border-red-400 focus-visible:ring-red-300' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
      </div>

      {/* Date + Time via DateTimeField */}
      <DateTimeField
        value={dateTime}
        onChange={syncDateTimeToForm}
        disabledFuture
        fromYear={1900}
        errorDate={isSubmitted && errors.birthDate ? errors.birthDate.message : undefined}
        errorTime={isSubmitted && errors.birthTime ? errors.birthTime.message : undefined}
      />

      {/* Birth Place */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Birth Place
        </Label>
        <CitySearch
          value={cityName}
          onSelect={handleCitySelect}
        />
        {isSubmitted && (errors.cityName || coordsError) && (
          <p className="text-sm text-destructive">
            {errors.cityName?.message ?? 'Please enter your Birth Place'}
          </p>
        )}
      </div>

      {/* Submit */}
      {cardError && (
        <p style={{ fontSize: '13px', color: '#DC2626', textAlign: 'center', padding: '8px 12px', background: 'rgba(220,38,38,.06)', borderRadius: '8px' }}>
          {cardError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg">
        See My Chart →
      </Button>

      <p className="text-center text-xs text-muted-foreground">
      </p>

      {/* Hidden fields — sent to API but not shown */}
      <input type="hidden" {...register('birthDate')} />
      <input type="hidden" {...register('birthTime')} />
      <input type="hidden" {...register('timePeriod')} />
    </form>
  )
}
