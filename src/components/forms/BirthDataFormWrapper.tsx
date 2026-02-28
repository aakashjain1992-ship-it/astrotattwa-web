'use client'

import { useState, useState  } from 'react'
import { BirthDataForm } from './BirthDataForm'
import { ChartLoader } from '@/components/ui/ChartLoader'
import { useRouter } from 'next/navigation'

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

 const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setIsAdmin(!!data?.user?.isAdmin)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  
  const router = useRouter()

  async function handleSubmit(values: ChartFormValues) {
    setLoading(true)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Calculation failed')

      const data = await res.json()

      // Temporarily store result until DB saving is implemented
      localStorage.setItem('lastChart', JSON.stringify({
        ...data.data,
        birthPlace: values.birthPlace,  // preserve city name for display & edit form
      }))
      await new Promise(resolve => setTimeout(resolve, 3000))
      router.push('/chart')
    } catch (err) {
      console.error('Chart calculation error:', err)
      setError('Failed to calculate chart. Please check your details and try again.')
    } finally {
      setLoading(true)
//      setError(null)
    }
  }

  return (
    <>
      <ChartLoader visible={loading} />
      <BirthDataForm onSubmit={handleSubmit} cardError={error ?? undefined} isAdmin={isAdmin} />
    </>
  )
}
