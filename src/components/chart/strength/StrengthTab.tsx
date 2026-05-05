'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChartData } from '@/types/astrology'
import type { ShadbalaResult } from '@/lib/astrology/shadbala'
import type { AshtakavargaResult } from '@/lib/astrology/ashtakavarga'
import { ShadbalaTable } from './ShadbalaTable'
import { AshtakavargaTable } from './AshtakavargaTable'

interface StrengthTabProps {
  chart: ChartData
  onStrengthReady: (shadBala: ShadbalaResult, ashtakavarga: AshtakavargaResult) => void
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[120, 80, 80].map((h, i) => (
        <div key={i} className="rounded-xl" style={{ height: h, background: 'hsl(var(--muted))' }} />
      ))}
    </div>
  )
}

export function StrengthTab({ chart, onStrengthReady }: StrengthTabProps) {
  const [shadBala, setShadBala] = useState<ShadbalaResult | null>(chart.shadBala ?? null)
  const [ashtakavarga, setAshtakavarga] = useState<AshtakavargaResult | null>(chart.ashtakavarga ?? null)
  const [loading, setLoading] = useState(!chart.shadBala || !chart.ashtakavarga)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (chart.shadBala && chart.ashtakavarga) {
      setShadBala(chart.shadBala)
      setAshtakavarga(chart.ashtakavarga)
      setLoading(false)
      return
    }
    fetchStrength()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.id, chart.planets?.Sun?.signNumber])

  async function fetchStrength() {
    setLoading(true)
    setError(null)

    const shadPayload = {
      planets: chart.planets,
      ascendant: chart.planets.Ascendant,
      birthDate: chart.input?.birthDate,
      birthTime: chart.input?.birthTime,
      latitude: chart.input?.latitude,
      longitude: chart.input?.longitude,
      julianDayUT: chart.calculated?.julianDayUT,
    }

    const ascSignNumber =
      (chart.planets.Ascendant as any)?.signNumber ??
      (chart as any).ascendant?.signNumber ??
      1

    const ashtaPayload = {
      planets: {
        Sun:     { signNumber: chart.planets.Sun?.signNumber },
        Moon:    { signNumber: chart.planets.Moon?.signNumber },
        Mars:    { signNumber: chart.planets.Mars?.signNumber },
        Mercury: { signNumber: chart.planets.Mercury?.signNumber },
        Jupiter: { signNumber: chart.planets.Jupiter?.signNumber },
        Venus:   { signNumber: chart.planets.Venus?.signNumber },
        Saturn:  { signNumber: chart.planets.Saturn?.signNumber },
      },
      ascendant: { signNumber: ascSignNumber },
    }

    try {
      const [shadRes, ashtaRes] = await Promise.all([
        fetch('/api/shadbala', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shadPayload),
        }),
        fetch('/api/ashtakavarga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ashtaPayload),
        }),
      ])

      const [shadJson, ashtaJson] = await Promise.all([
        shadRes.json(),
        ashtaRes.json(),
      ])

      if (!shadRes.ok || !shadJson.success) {
        setError(shadJson.error ?? 'Failed to load Shadbala data.')
        return
      }
      if (!ashtaRes.ok || !ashtaJson.success) {
        setError(ashtaJson.error ?? 'Failed to load Ashtakavarga data.')
        return
      }

      const shadResult: ShadbalaResult = shadJson.data
      const ashtaResult: AshtakavargaResult = ashtaJson.data

      setShadBala(shadResult)
      setAshtakavarga(ashtaResult)
      onStrengthReady(shadResult, ashtaResult)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div
        className="rounded-xl p-5 flex flex-col items-center gap-3 text-center"
        style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}
      >
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm" style={{ color: 'var(--text2)' }}>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchStrength} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  if (!shadBala || !ashtakavarga) return null

  return (
    <div className="space-y-8 animate-fade-in">
      <ShadbalaTable data={shadBala} />
      <AshtakavargaTable data={ashtakavarga} />
    </div>
  )
}
