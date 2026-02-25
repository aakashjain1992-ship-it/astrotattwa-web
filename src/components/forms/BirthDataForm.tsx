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
import { DateTimeField, GenderField } from './DateTimeField'
import type { ChartFormValues } from './BirthDataFormWrapper'

// Extend the shared base schema with city-specific fields
const birthDataSchema = baseBirthSchema.extend({
  cityId:    z.number().optional(),
  stateName: z.string().optional(),
})

type BirthDataFormValues = z.infer<typeof birthDataSchema>

interface Props {
  cardError?: string,  
  onSubmit: (values: ChartFormValues) => void
}

export function BirthDataForm({ onSubmit, cardError }: Props) {
  const [isTestData, setIsTestData]   = useState(false)
  const [coordsError, setCoordsError] = useState(false)

  // Coordinates + timezone stored outside form state (set by CitySearch)
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
    mode: 'onSubmit',        // ✅ No errors on initial render
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

  const { dateTime, setDateTime, syncDateTimeToForm } = useDateTimeSync(setValue)

  const cityName = watch('cityName')

  const canBuildDateTime = useMemo(
    () => !!dateTime.date && !!dateTime.hour && !!dateTime.minute && !!dateTime.period,
    [dateTime],
  )

  // ── Fill test data ──────────────────────────────────────────────
  const fillTestData = () => {
    setValue('name', 'Test Chart')
    setValue('gender', 'Male')

    const d = new Date(1992, 2, 25) // 25 Mar 1992
    setDateTime({ date: d, hour: '11', minute: '55', period: 'AM' })
    setValue('birthDate',  formatDate(d, 'yyyy-MM-dd'))
    setValue('birthTime',  '11:55')
    setValue('timePeriod', 'AM')

    setValue('cityName', 'Baghpat, Uttar Pradesh')
    coordsRef.current = { lat: 28.9475, lng: 77.2156, timezone: 'Asia/Kolkata' }
    setCoordsError(false)
    setIsTestData(true)
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
    setValue('cityId',    city.id)
    setValue('cityName',  `${city.city_name}, ${city.state_name}`)
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

      {/* Card header: title + button inline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontFamily: "FangSong, STFangSong, fangsong, Georgia, serif", fontSize: '26px', color: 'var(--text)', marginBottom: '4px', lineHeight: 1.2 }}>
            Check your Kundli
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text3)', margin: 0 }}>
            Enter your birth details to see your chart
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fillTestData} style={{ flexShrink: 0, marginTop: '4px' }}>
          {isTestData ? '✓ Test Data Loaded' : 'Load Test Data'}
        </Button>
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
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <GenderField
            value={field.value as "Male" | "Female" | ""}
            onChange={field.onChange}
            error={errors.gender?.message}
          />
        )}
      />

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
