'use client'

import type { YogaAnalysisResponse } from '@/lib/astrology/yogas/types'

interface YogaSummaryCardProps {
  summary: YogaAnalysisResponse['summary']
}

interface MetricRowProps {
  label: string
  value: string | null
  accent?: boolean
}

function MetricRow({ label, value, accent }: MetricRowProps) {
  if (value === null) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text3)' }}>{label}</span>
      <span className={`text-sm font-medium text-right max-w-[60%] ${accent ? 'text-emerald-600 dark:text-emerald-400' : ''}`} style={accent ? {} : { color: 'var(--text)' }}>
        {value}
      </span>
    </div>
  )
}

export function YogaSummaryCard({ summary }: YogaSummaryCardProps) {
  const { text, metrics } = summary
  const { positiveYogasFound, challengingPatternsFound, strongestYoga, mostImportantCaution, currentlyActive } = metrics

  return (
    <div className="rounded-xl p-5" style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text2)' }}>{text}</p>
      <div>
        <MetricRow label="Positive yogas found" value={String(positiveYogasFound)} accent />
        <MetricRow label="Challenging patterns" value={String(challengingPatternsFound)} />
        <MetricRow label="Strongest yoga" value={strongestYoga} />
        <MetricRow label="Most important caution" value={mostImportantCaution} />
        <MetricRow
          label="Currently active"
          value={currentlyActive ?? 'Timing analysis will be added soon.'}
        />
      </div>
    </div>
  )
}
