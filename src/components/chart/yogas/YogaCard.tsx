'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  defaultExpanded?: boolean
  hero?: boolean
}

export function YogaCard({ yoga, defaultExpanded = false, hero = false }: YogaCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  const meaning = YOGA_MEANINGS[yoga.id]
  const badgeClass = yoga.strength ? (STRENGTH_BADGE[yoga.strength] ?? STRENGTH_BADGE.moderate) : STRENGTH_BADGE.moderate

  const borderColor = hero
    ? isDark ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.2)'
    : tw(0.08)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'hsl(var(--card))', border: `1px solid ${borderColor}` }}
    >
      {/* Header — always visible, clickable */}
      <button
        type="button"
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {yoga.currentlyActive && (
              <span className="shrink-0 inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className="font-semibold text-sm leading-snug" style={{ color: 'var(--text)' }}>
              {yoga.name}
            </span>
          </div>
          {!expanded && meaning && (
            <p className="text-xs truncate pr-2" style={{ color: 'var(--text3)' }}>
              {meaning.shortMeaning}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {yoga.strength && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
              {yoga.strength.replace('_', ' ')}
            </span>
          )}
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform duration-200"
            style={{
              color: 'var(--text3)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Expandable body */}
      {expanded && meaning && (
        <div className="px-4 pb-4">
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '2px', marginBottom: '16px' }} />

          {/* In your chart — chart-specific narrative */}
          {yoga.chartNarrative && (
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text3)' }}>
                In your chart
              </p>
              <div className="space-y-2.5">
                {yoga.chartNarrative.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{para}</p>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', marginBottom: '16px' }} />
            </div>
          )}

          {/* Generic explanations */}
          <div className="space-y-4">
            <DetailRow label="What it means" text={meaning.whatItMeans} />
            <DetailRow label="What strengthens it" text={meaning.strengthens} />
            <DetailRow label="What weakens it" text={meaning.weakens} />
            <DetailRow label="When it gives results" text={meaning.whenItGivesResults} />
          </div>

          <TechnicalDetailsAccordion
            technicalReason={yoga.technicalReason}
            planetsInvolved={yoga.planetsInvolved}
            housesInvolved={yoga.housesInvolved}
            scoreBreakdown={yoga.scoreBreakdown}
          />
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, text }: { label: string; text: string }) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text3)' }}>{label}</p>
      <div className="space-y-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{p}</p>
        ))}
      </div>
    </div>
  )
}
