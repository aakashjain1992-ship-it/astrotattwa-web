'use client'

import type { YogaAnalysisResponse } from '@/lib/astrology/yogas/types'

interface YogaSummaryCardProps {
  summary: YogaAnalysisResponse['summary']
}

export function YogaSummaryCard({ summary }: YogaSummaryCardProps) {
  const { text, metrics } = summary
  const { positiveYogasFound, challengingPatternsFound, currentlyActive } = metrics

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{text}</p>
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
    </div>
  )
}
