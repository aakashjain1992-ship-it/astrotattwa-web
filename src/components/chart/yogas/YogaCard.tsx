'use client'

import { useTheme } from '@/components/theme-provider'
import type { YogaResult } from '@/lib/astrology/yogas/types'
import { YOGA_MEANINGS } from '@/lib/astrology/yogas/meanings'
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion'

const STRENGTH_BADGE: Record<string, string> = {
  exceptional: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  very_strong:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  strong:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  moderate:     'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  weak:         'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
}

interface YogaCardProps {
  yoga: YogaResult
}

export function YogaCard({ yoga }: YogaCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  const meaning = YOGA_MEANINGS[yoga.id]
  const badgeClass = yoga.strength ? (STRENGTH_BADGE[yoga.strength] ?? STRENGTH_BADGE.moderate) : STRENGTH_BADGE.moderate

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'hsl(var(--card))', border: `1px solid ${tw(0.1)}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {yoga.currentlyActive && (
            <span className="shrink-0 inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{yoga.name}</span>
        </div>
        {yoga.strength && (
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
            {yoga.strength.replace('_', ' ')}
          </span>
        )}
      </div>

      {meaning && (
        <div className="space-y-2.5">
          <DetailRow label="What it means" text={meaning.whatItMeans} />
          <DetailRow label="What strengthens it" text={meaning.strengthens} />
          <DetailRow label="What weakens it" text={meaning.weakens} />
          <DetailRow label="When it gives results" text={meaning.whenItGivesResults} />
        </div>
      )}

      <TechnicalDetailsAccordion
        technicalReason={yoga.technicalReason}
        planetsInvolved={yoga.planetsInvolved}
        housesInvolved={yoga.housesInvolved}
        scoreBreakdown={yoga.scoreBreakdown}
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
