'use client'

import { useState } from 'react'
import { BirthDataForm } from './BirthDataForm'
import { ChartLoader } from '@/components/ui/ChartLoader'
import { useRouter } from 'next/navigation'
import { useSavedCharts, type SavedChart } from '@/hooks/useSavedCharts'

export interface ChartFormValues {
  name: string
  gender?: string
  birthDate: string
  birthTime: string
  timePeriod: string
  birthPlace: string
  latitude: number
  longitude: number
  timezone: string
}

export default function BirthDataFormWrapper() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { isLoggedIn, hasSavedCharts, charts } = useSavedCharts()

  async function handleSubmit(values: ChartFormValues) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Calculation failed')

      const data = await res.json()

      localStorage.setItem('lastChart', JSON.stringify({
        ...data.data,
        birthPlace: values.birthPlace,
      }))
      await new Promise(resolve => setTimeout(resolve, 3000))
      router.push('/chart')
    } catch (err) {
      console.error('Chart calculation error:', err)
      setError('Failed to calculate chart. Please check your details and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <ChartLoader visible={loading} />
      <BirthDataForm
        onSubmit={handleSubmit}
        cardError={error ?? undefined}
        showSavedCharts={isLoggedIn && hasSavedCharts}
        savedCharts={charts}
      />
    </>
  )
}
