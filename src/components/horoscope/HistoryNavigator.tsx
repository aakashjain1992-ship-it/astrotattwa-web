'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HoroscopeRow, HoroscopeType } from '@/types/horoscope'

interface HistoryNavigatorProps {
  history: Pick<HoroscopeRow, 'id' | 'period_start' | 'period_end'>[]
  currentPeriodStart: string
  type: HoroscopeType
  onSelect: (periodStart: string) => void
}

function formatPeriodLabel(type: HoroscopeType, start: string, end: string): string {
  const s = new Date(start + 'T00:00:00Z')
  if (type === 'daily') {
    return s.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  }
  if (type === 'weekly') {
    const e = new Date(end + 'T00:00:00Z')
    return `${s.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${e.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
  }
  return s.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function HistoryNavigator({ history, currentPeriodStart, type, onSelect }: HistoryNavigatorProps) {
  if (history.length <= 1) return null

  const currentIdx = history.findIndex(h => h.period_start === currentPeriodStart)
  const hasPrev = currentIdx < history.length - 1  // history is desc
  const hasNext = currentIdx > 0

  const current = history[currentIdx]

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-t border-border mt-2">
      <button
        onClick={() => hasPrev && onSelect(history[currentIdx + 1].period_start)}
        disabled={!hasPrev}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {current && (
        <span className="text-sm text-muted-foreground text-center">
          {formatPeriodLabel(type, current.period_start, current.period_end)}
        </span>
      )}

      <button
        onClick={() => hasNext && onSelect(history[currentIdx - 1].period_start)}
        disabled={!hasNext}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
