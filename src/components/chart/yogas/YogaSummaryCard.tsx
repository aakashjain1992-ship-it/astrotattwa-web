'use client'

import type { YogaAnalysisResponse, YogaResult } from '@/lib/astrology/yogas/types'

interface YogaSummaryCardProps {
  summary: YogaAnalysisResponse['summary']
  allYogas?: YogaResult[]
}

const BAR_SEGMENTS = [
  { keys: ['exceptional', 'very_strong'], label: 'Very Strong', color: 'rgb(16,185,129)' },
  { keys: ['strong'],                     label: 'Strong',      color: 'rgb(52,211,153)' },
  { keys: ['moderate'],                   label: 'Moderate',    color: 'rgb(56,189,248)' },
  { keys: ['weak'],                       label: 'Weak',        color: 'rgb(148,163,184)' },
]

export function YogaSummaryCard({ summary, allYogas = [] }: YogaSummaryCardProps) {
  const { text, metrics } = summary
  const { positiveYogasFound, challengingPatternsFound, currentlyActive } = metrics

  const counts = BAR_SEGMENTS.map(seg => ({
    ...seg,
    count: allYogas.filter(y => seg.keys.includes(y.strength ?? '')).length,
  })).filter(s => s.count > 0)

  const total = counts.reduce((s, c) => s + c.count, 0)

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{text}</p>

      {/* Metric badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {positiveYogasFound} supportive {positiveYogasFound === 1 ? 'yoga' : 'yogas'}
        </span>
        {challengingPatternsFound > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            {challengingPatternsFound} challenging {challengingPatternsFound === 1 ? 'pattern' : 'patterns'}
          </span>
        )}
        {currentlyActive && (
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {currentlyActive} active now
          </span>
        )}
      </div>

      {/* Strength distribution bar */}
      {total > 0 && (
        <div className="space-y-2">
          {/* Bar */}
          <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
            {counts.map(seg => (
              <div
                key={seg.label}
                style={{ width: `${(seg.count / total) * 100}%`, background: seg.color, borderRadius: 2 }}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {counts.map(seg => (
              <span key={seg.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text3)' }}>
                <span className="inline-block h-2 w-2 rounded-sm shrink-0" style={{ background: seg.color }} />
                {seg.count} {seg.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
