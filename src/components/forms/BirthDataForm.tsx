'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, User, Clock } from 'lucide-react'
import { CitySearch } from './CitySearch'

const birthDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
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
      birthDate: '',
      birthTime: '',
      cityName: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata',
    },
  })

  const cityName = watch('cityName')

  const fillTestData = () => {
    setValue('name', 'Test Chart')
    setValue('birthDate', '1992-03-25')
    setValue('birthTime', '11:55')
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

  const onSubmit = async (data: BirthDataForm) => {
    console.log('Form data:', data)
    
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Calculation failed')

      const result = await response.json()
      console.log('Chart calculated:', result)
      alert('Chart calculated successfully! (View will be implemented next)')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to calculate chart. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fillTestData}
        >
          {isTestData ? '✓ Test Data Loaded' : 'Load Test Data'}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Chart Name
        </Label>
        <Input
          id="name"
          placeholder="e.g., My Chart, Mom, Partner"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Birth Date
        </Label>
        <Input
          id="birthDate"
          type="date"
          {...register('birthDate')}
        />
        {errors.birthDate && (
          <p className="text-sm text-destructive">{errors.birthDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthTime" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Birth Time
        </Label>
        <Input
          id="birthTime"
          type="time"
          {...register('birthTime')}
        />
        {errors.birthTime && (
          <p className="text-sm text-destructive">{errors.birthTime.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter time in 24-hour format (e.g., 11:55 for 11:55 AM)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Birth Place
        </Label>
        <CitySearch
          value={cityName}
          onSelect={handleCitySelect}
        />
        {errors.cityName && (
          <p className="text-sm text-destructive">{errors.cityName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="28.6139"
            {...register('latitude', { valueAsNumber: true })}
          />
          {errors.latitude && (
            <p className="text-sm text-destructive">{errors.latitude.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="77.2090"
            {...register('longitude', { valueAsNumber: true })}
          />
          {errors.longitude && (
            <p className="text-sm text-destructive">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          {...register('timezone')}
          readOnly
          className="bg-muted"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Calculating...' : 'Calculate Birth Chart'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No login required. You can save your chart later.
      </p>
    </form>
  )
}
