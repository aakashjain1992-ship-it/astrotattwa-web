'use client'

import { useState } from 'react'
import { ChevronDown, Code2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import type { YogaResult, LifeArea } from '@/lib/astrology/yogas/types'
import { YOGA_MEANINGS } from '@/lib/astrology/yogas/meanings'
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion'

const STRENGTH_ACCENT: Record<string, string> = {
  exceptional: 'rgba(245,158,11,0.7)',
  very_strong: 'rgba(16,185,129,0.65)',
  strong:      'rgba(52,211,153,0.5)',
  moderate:    'rgba(56,189,248,0.45)',
  weak:        'rgba(148,163,184,0.3)',
}

const STRENGTH_BADGE: Record<string, string> = {
  exceptional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  very_strong: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  strong:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  moderate:    'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  weak:        'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400',
}

const LIFE_AREA_LABEL: Record<LifeArea, string> = {
  career: 'Career', wealth: 'Wealth', marriage: 'Marriage',
  education: 'Education', children: 'Children', health: 'Health',
  family: 'Family', spirituality: 'Spirituality', emotional_life: 'Emotional',
}

interface YogaCardProps {
  yoga: YogaResult
  defaultExpanded?: boolean
  hero?: boolean
  isLocked?: boolean
  onSignIn?: () => void
}

export function YogaCard({ yoga, defaultExpanded = false, isLocked = false, onSignIn }: YogaCardProps) {
  const [expanded, setExpanded] = useState(isLocked ? false : defaultExpanded)
  const [activeTab, setActiveTab] = useState<'chart' | 'about'>('chart')
  const [techOpen, setTechOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const meaning = YOGA_MEANINGS[yoga.id]
  const strengthKey = yoga.strength ?? 'weak'
  const badgeClass = STRENGTH_BADGE[strengthKey] ?? STRENGTH_BADGE.moderate
  const accentColor = STRENGTH_ACCENT[strengthKey] ?? STRENGTH_ACCENT.weak

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.08)'}`,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* Header — always visible */}
      <button
        type="button"
        className="w-full text-left px-4 py-3.5"
        onClick={() => isLocked ? onSignIn?.() : setExpanded(v => !v)}
      >
        {/* Row 1: name + strength badge + chevron */}
        <div className="flex items-center gap-2 mb-1">
          {yoga.currentlyActive && (
            <span className="shrink-0 inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="font-semibold text-sm leading-snug flex-1 min-w-0" style={{ color: 'var(--text)' }}>
            {yoga.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {yoga.strength && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
                {yoga.strength.replace('_', ' ')}
              </span>
            )}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ color: 'var(--text3)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </div>

        {/* Row 2: short meaning preview + life area chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {!expanded && meaning && (
            <p className="text-xs flex-1 min-w-0 truncate" style={{ color: 'var(--text3)' }}>
              {meaning.shortMeaning}
            </p>
          )}
          {yoga.lifeAreas.slice(0, 3).map(area => (
            <span
              key={area}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,23,0.05)',
                color: 'var(--text3)',
              }}
            >
              {LIFE_AREA_LABEL[area]}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && meaning && (
        <div className="px-4 pb-4">
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '14px' }} />

          {/* Inner tabs */}
          <div className="flex gap-1 p-0.5 rounded-lg w-fit mb-4" style={{ background: 'hsl(var(--muted))' }}>
            {(['chart', 'about'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab) }}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={activeTab === tab
                  ? { background: 'hsl(var(--background))', color: 'var(--text)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                  : { color: 'var(--text3)' }}
              >
                {tab === 'chart' ? 'Your Chart' : 'About this yoga'}
              </button>
            ))}
          </div>

          {/* Your Chart tab */}
          {activeTab === 'chart' && (
            <div className="space-y-2.5">
              {yoga.chartNarrative ? (
                yoga.chartNarrative.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{para}</p>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Analysis not available for this yoga.</p>
              )}
            </div>
          )}

          {/* About this yoga tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <DetailRow label="What it means" text={meaning.whatItMeans} />
              <DetailRow label="What strengthens it" text={meaning.strengthens} />
              <DetailRow label="What weakens it" text={meaning.weakens} />
              <DetailRow label="When it gives results" text={meaning.whenItGivesResults} />
            </div>
          )}

          {/* Technical details — compact code-icon trigger */}
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text3)' }}
              onClick={() => setTechOpen(v => !v)}
            >
              <Code2 className="h-3 w-3" />
              {techOpen ? 'Hide technical details' : 'Technical details'}
            </button>
            {techOpen && (
              <div className="mt-3">
                <TechnicalDetailsAccordion
                  technicalReason={yoga.technicalReason}
                  planetsInvolved={yoga.planetsInvolved}
                  housesInvolved={yoga.housesInvolved}
                  scoreBreakdown={yoga.scoreBreakdown}
                  noWrapper
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text3)' }}>{label}</p>
      <div className="space-y-2">
        {text.split('\n\n').filter(Boolean).map((p, i) => (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{p}</p>
        ))}
      </div>
    </div>
  )
}
