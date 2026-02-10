'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format as formatDate } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, User } from 'lucide-react'
import { CitySearch } from './CitySearch'
import { DateTimeField, DateTimeValue } from './DateTimeField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const birthDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required' }),

  // API expects these:
  birthDate: z.string().min(1, 'Birth date is required'), // YYYY-MM-DD
  birthTime: z.string().min(1, 'Birth time is required'), // hh:mm (12-hour)
  timePeriod: z.enum(['AM', 'PM'], { required_error: 'AM/PM is required' }),

  cityId: z.number().optional(),
  cityName: z.string().min(1, 'Birth place is required'),
  stateName: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().default('Asia/Kolkata'),
})

type BirthDataForm = z.infer<typeof birthDataSchema>

export default function BirthDataForm() {
  const [isTestData, setIsTestData] = useState(false)
  const [dateTime, setDateTime] = useState<DateTimeValue>({
    date: undefined,
    hour: undefined,
    minute: undefined,
    period: 'AM',
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BirthDataForm>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: '',
      gender: 'Male',
      birthDate: '',
      birthTime: '',
      timePeriod: 'AM',
      cityName: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
    },
  })

  const cityName = watch('cityName')

  const canBuildDateTime = useMemo(() => {
    return !!dateTime.date && !!dateTime.hour && !!dateTime.minute && !!dateTime.period
  }, [dateTime])

  const fillTestData = () => {
    setValue('name', 'Test Chart')
    setValue('gender', 'Male')

    // set DateTimeField + also sync API fields
    const d = new Date(1992, 2, 25) // 25 Mar 1992 (month is 0-based)
    setDateTime({ date: d, hour: '11', minute: '55', period: 'AM' })
    setValue('birthDate', formatDate(d, 'yyyy-MM-dd'))
    setValue('birthTime', '11:55')
    setValue('timePeriod', 'AM')

    setValue('cityName', 'Baghpat, Uttar Pradesh')
    setValue('stateName', 'Uttar Pradesh')
    setValue('latitude', 28.9475)
    setValue('longitude', 77.2156)
    setValue('timezone', 'Asia/Kolkata')
    setIsTestData(true)
  }

  const handleCitySelect = (city: {
    id: number
    city_name: string
    state_name: string
    latitude: number
    longitude: number
    timezone: string
  }) => {
    setValue('cityId', city.id)
    setValue('cityName', `${city.city_name}, ${city.state_name}`)
    setValue('stateName', city.state_name)
    setValue('latitude', city.latitude)
    setValue('longitude', city.longitude)
    setValue('timezone', city.timezone)
  }

  const syncDateTimeToForm = (next: DateTimeValue) => {
    setDateTime(next)

    // Only sync when we have a full valid set
    if (next.date) {
      setValue('birthDate', formatDate(next.date, 'yyyy-MM-dd'), { shouldValidate: true })
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

  const onSubmit = async (data: BirthDataForm) => {
    // quick safety check (so we never send partial date/time)
    if (!canBuildDateTime) {
      alert('Please select a valid birth date and time.')
      return
    }

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Calculation failed')

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('lastChart', JSON.stringify(result.data))
        window.location.href = '/chart'
      } else {
        alert(`Error: ${result.error || 'Calculation failed'}`)
      }
    } catch {
      alert('Failed to calculate chart. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={fillTestData}>
          {isTestData ? '✓ Test Data Loaded' : 'Load Test Data'}
        </Button>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </Label>
        <Input id="name" placeholder="e.g., Aakash Jain" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select
          value={watch('gender')}
          onValueChange={(v) => setValue('gender', v as 'Male' | 'Female', { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
      </div>

      {/* Date + Time (custom, non-browser) */}
      <DateTimeField
        value={dateTime}
        onChange={syncDateTimeToForm}
        disabledFuture
        fromYear={1900}
      />
      {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
      {errors.birthTime && <p className="text-sm text-destructive">{errors.birthTime.message}</p>}
      {errors.timePeriod && <p className="text-sm text-destructive">{errors.timePeriod.message}</p>}

      {/* Birth Place */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Birth Place
        </Label>
        <CitySearch value={cityName} onSelect={handleCitySelect} />
        {errors.cityName && <p className="text-sm text-destructive">{errors.cityName.message}</p>}
      </div>

      {/* Lat/Long */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="28.6139"
            {...register('latitude', { valueAsNumber: true })}
            readOnly
            className="bg-muted"
          />
          {errors.latitude && <p className="text-sm text-destructive">{errors.latitude.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="77.2090"
            {...register('longitude', { valueAsNumber: true })}
            readOnly
            className="bg-muted"
          />
          {errors.longitude && <p className="text-sm text-destructive">{errors.longitude.message}</p>}
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input id="timezone" {...register('timezone')} readOnly className="bg-muted" />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Calculating...' : 'Calculate Birth Chart'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No login required. You can save your chart later.
      </p>

      {/* Hidden fields (react-hook-form already has them via setValue, but these keep things explicit) */}
      <input type="hidden" {...register('birthDate')} />
      <input type="hidden" {...register('birthTime')} />
      <input type="hidden" {...register('timePeriod')} />
    </form>
  )
}
