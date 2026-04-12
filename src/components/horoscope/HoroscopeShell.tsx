'use client'

import { useState, useCallback, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RashiSelector } from './RashiSelector'
import { SignTypeToggle } from './SignTypeToggle'
import { LanguageToggle } from './LanguageToggle'
import { HoroscopeContent } from './HoroscopeContent'
import { HoroscopeLoading } from './HoroscopeLoading'
import { getRashiBySlug } from '@/lib/horoscope/rashiMap'
import type { HoroscopeRow, HoroscopeType, SignType, HoroscopeLang } from '@/types/horoscope'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<HoroscopeType, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
}

interface HoroscopeShellProps {
  initialType:  HoroscopeType
  initialRashi: string
  initialData:  HoroscopeRow | null
  today:        string
}

export function HoroscopeShell({ initialType, initialRashi, initialData, today }: HoroscopeShellProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [signType, setSignType]   = useState<SignType>('moon')
  const [lang, setLang]           = useState<HoroscopeLang>(() => {
    if (typeof window === 'undefined') return 'en'
    return (localStorage.getItem('horoscope_lang') as HoroscopeLang) ?? 'en'
  })
  const [data, setData]           = useState<HoroscopeRow | null>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory]     = useState<Pick<HoroscopeRow, 'id' | 'period_start' | 'period_end'>[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const rashiInfo = getRashiBySlug(initialRashi)

  const fetchHoroscope = useCallback(async (
    type: HoroscopeType,
    rashi: string,
    sType: SignType,
    date?: string
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ type, rashi, sign_type: sType })
      if (date) params.set('date', date)
      const res = await fetch(`/api/horoscope?${params}`)
      if (!res.ok) throw new Error('Failed to load horoscope')
      const json = await res.json()
      setData(json.data)
    } catch (e) {
      setError('Unable to load horoscope right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadHistory = useCallback(async (type: HoroscopeType, rashi: string, sType: SignType) => {
    if (historyLoaded) return
    try {
      const res = await fetch(`/api/horoscope/history?type=${type}&rashi=${rashi}&sign_type=${sType}`)
      if (!res.ok) return
      const json = await res.json()
      setHistory(json.data ?? [])
      setHistoryLoaded(true)
    } catch {
      // History is non-critical
    }
  }, [historyLoaded])

  // Load history on mount so Prev/Next buttons are available immediately
  useEffect(() => {
    loadHistory(initialType, initialRashi, signType)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignTypeChange = (sType: SignType) => {
    setSignType(sType)
    fetchHoroscope(initialType, initialRashi, sType)
    setHistoryLoaded(false)
  }

  const handleHistorySelect = (periodStart: string) => {
    fetchHoroscope(initialType, initialRashi, signType, periodStart)
  }

  const content = data ? (lang === 'en' ? data.content_en : data.content_hi) : null

  const periodLabel = data
    ? formatPeriodDisplay(initialType, data.period_start, data.period_end)
    : formatCurrentPeriod(initialType, today)

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6">

      {/* Hero: rashi name + symbol */}
      <div className="text-center space-y-1 pt-2">
        <div className="text-5xl">{rashiInfo?.symbol}</div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          {rashiInfo?.nameEn}
          <span className="text-muted-foreground text-2xl ml-2 font-normal">{rashiInfo?.nameHi}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{periodLabel}</p>
        {data?.isFallback && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full inline-block">
            Showing latest available — today&apos;s horoscope not yet generated
          </p>
        )}
      </div>

      {/* Type tabs + Prev/Next navigation */}
      {(() => {
        const currentIdx = history.findIndex(h => h.period_start === data?.period_start)
        const hasPrev = history.length > 1 && currentIdx < history.length - 1
        const hasNext = history.length > 1 && currentIdx > 0
        return (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => hasPrev && handleHistorySelect(history[currentIdx + 1].period_start)}
              disabled={!hasPrev}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[80px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex rounded-xl border border-border bg-muted/30 p-1 gap-1">
              {(Object.keys(TYPE_LABELS) as HoroscopeType[]).map(t => (
                <button
                  key={t}
                  onClick={() => startTransition(() => router.push(`/horoscope/${t}/${initialRashi}`))}
                  className={cn(
                    'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    initialType === t
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <button
              onClick={() => hasNext && handleHistorySelect(history[currentIdx - 1].period_start)}
              disabled={!hasNext}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors justify-end min-w-[80px]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )
      })()}

      {/* Rashi selector */}
      <RashiSelector currentRashi={initialRashi} currentType={initialType} lang={lang} />

      {/* Controls row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SignTypeToggle value={signType} onChange={handleSignTypeChange} />
        <LanguageToggle value={lang} onChange={l => { setLang(l); localStorage.setItem('horoscope_lang', l) }} />
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8">
        {isLoading ? (
          <HoroscopeLoading />
        ) : error ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => fetchHoroscope(initialType, initialRashi, signType)}
              className="text-sm text-amber-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : !content ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg font-medium mb-1">Horoscope coming soon</p>
            <p className="text-sm">The horoscope for this period hasn&apos;t been generated yet. Check back shortly.</p>
          </div>
        ) : (
          <HoroscopeContent content={content} type={initialType} lang={lang} />
        )}

      </div>
    </div>
  )
}

/** Compute the correct current period label when no DB data is available yet */
function formatCurrentPeriod(type: HoroscopeType, today: string): string {
  const d = new Date(today + 'T00:00:00Z')
  if (type === 'daily') {
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  }
  if (type === 'weekly') {
    const dayOfWeek = d.getUTCDay()
    const daysFromMonday = (dayOfWeek + 6) % 7
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() - daysFromMonday)
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    const fmt = (dt: Date) => dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getUTCFullYear()}`
  }
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatPeriodDisplay(type: HoroscopeType, start: string, end: string): string {
  const s = new Date(start + 'T00:00:00Z')
  if (type === 'daily') {
    return s.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  }
  if (type === 'weekly') {
    const e = new Date(end + 'T00:00:00Z')
    return `${s.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${e.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
  }
  return s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
