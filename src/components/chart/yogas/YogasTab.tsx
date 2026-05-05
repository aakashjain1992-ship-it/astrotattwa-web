'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import type { ChartData } from '@/types/astrology'
import type { YogaAnalysisResponse } from '@/lib/astrology/yogas/types'
import { YogaSummaryCard } from './YogaSummaryCard'
import { TopPositiveYogas } from './TopPositiveYogas'
import { ChallengingPatterns } from './ChallengingPatterns'
import { YogaList } from './YogaList'
import { SignInModal } from './SignInModal'

interface YogasTabProps {
  chart: ChartData
  onAnalysisReady: (analysis: YogaAnalysisResponse) => void
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

export function YogasTab({ chart, onAnalysisReady }: YogasTabProps) {
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<YogaAnalysisResponse | null>(chart.yogaAnalysis ?? null)
  const [loading, setLoading] = useState(!chart.yogaAnalysis)
  const [error, setError] = useState<string | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    if (chart.yogaAnalysis && (chart.yogaAnalysis.version ?? 0) >= 2) {
      setAnalysis(chart.yogaAnalysis)
      setLoading(false)
      return
    }
    fetchAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.id])

  async function fetchAnalysis() {
    setLoading(true)
    setError(null)

    const moon = chart.planets?.Moon
    const balance = chart.dasa?.balance
    const balanceYears = balance
      ? balance.years + (balance.months ?? 0) / 12 + (balance.days ?? 0) / 365
      : undefined

    const payload: Record<string, unknown> = {
      planets: chart.planets,
      ascendant: chart.planets.Ascendant,
      birthDateUtc: chart.calculated?.utcDateTime,
      nakshatraLord: chart.avakahada?.nakshatraLord ?? moon?.kp?.nakshatraLord,
      balanceYears,
    }

    // Only include chartId for logged-in users with a saved chart
    if (user && chart.id && !chart.id.startsWith('local-')) {
      payload.chartId = chart.id
    }

    try {
      const res = await fetch('/api/yogas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to load yoga analysis.')
        return
      }
      const result: YogaAnalysisResponse = json.data
      setAnalysis(result)
      onAnalysisReady(result)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="rounded-xl p-5 flex flex-col items-center gap-3 text-center" style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm" style={{ color: 'var(--text2)' }}>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchAnalysis} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  if (!analysis) return null

  if (user) {
    return (
      <div className="space-y-6">
        <YogaSummaryCard summary={analysis.summary} allYogas={analysis.allYogas} />
        <YogaList yogas={analysis.allYogas} doshas={analysis.allDoshas} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <YogaSummaryCard summary={analysis.summary} allYogas={analysis.allYogas} />

      <TopPositiveYogas
        items={analysis.topPositive}
        allYogas={analysis.allYogas}
        emptyMessage={analysis.emptyYogasMessage}
        isLocked
        onSignIn={() => setSignInOpen(true)}
      />

      <ChallengingPatterns
        items={analysis.topChallenging}
        allDoshas={analysis.allDoshas}
        emptyMessage={analysis.emptyDoshasMessage}
        isLocked
        onSignIn={() => setSignInOpen(true)}
      />

      <div className="text-center pt-2">
        <Button variant="outline" onClick={() => setSignInOpen(true)}>
          Sign in to see all yogas
        </Button>
      </div>

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        title="Sign in to unlock yoga details"
        description="Read what each yoga means specifically in your chart."
      />
    </div>
  )
}
