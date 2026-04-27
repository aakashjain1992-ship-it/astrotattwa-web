'use client'

import { useTheme } from '@/components/theme-provider'
import type { DoshaResult, SeverityLabel } from '@/lib/astrology/yogas/types'
import { DOSHA_MEANINGS } from '@/lib/astrology/yogas/meanings'
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion'

const SEVERITY_STYLES: Record<SeverityLabel, { badge: string; border: string }> = {
  mild:       { badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', border: 'rgba(234,179,8,0.2)' },
  moderate:   { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',    border: 'rgba(245,158,11,0.25)' },
  strong:     { badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', border: 'rgba(249,115,22,0.3)' },
  very_strong:{ badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',            border: 'rgba(239,68,68,0.3)' },
}

interface DoshaCardProps {
  dosha: DoshaResult
}

export function DoshaCard({ dosha }: DoshaCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  const meaning = DOSHA_MEANINGS[dosha.id]
  const severity = dosha.severity ?? 'mild'
  const styles = SEVERITY_STYLES[severity]
  const borderColor = dosha.severity ? styles.border : tw(0.1)

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'hsl(var(--card))', border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {dosha.currentlyActive && (
            <span className="shrink-0 inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{dosha.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {dosha.isReduced && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              partly reduced
            </span>
          )}
          {dosha.severity && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
              {severity.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {meaning && (
        <div className="space-y-2.5">
          <DetailRow label="What it shows" text={meaning.whatItMeans} />
          <DetailRow label="What reduces it" text={meaning.whatReducesIt} />
          <DetailRow label="How to read it" text={meaning.guidance} />
        </div>
      )}

      <TechnicalDetailsAccordion
        technicalReason={dosha.technicalReason}
        planetsInvolved={dosha.planetsInvolved}
        housesInvolved={dosha.housesInvolved}
        scoreBreakdown={dosha.scoreBreakdown}
      />
    </div>
  )
}

function DetailRow({ label, text }: { label: string; text: string }) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>{label}</p>
      <div className="space-y-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{p}</p>
        ))}
      </div>
    </div>
  )
}
