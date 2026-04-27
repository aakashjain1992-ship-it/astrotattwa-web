'use client'

import { useState } from 'react'
import { ChevronDown, Code2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import type { DoshaResult, SeverityLabel, LifeArea } from '@/lib/astrology/yogas/types'
import { DOSHA_MEANINGS } from '@/lib/astrology/yogas/meanings'
import { TechnicalDetailsAccordion } from './TechnicalDetailsAccordion'

const SEVERITY_STYLES: Record<SeverityLabel, { badge: string; accent: string }> = {
  mild:        { badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',   accent: 'rgba(234,179,8,0.5)' },
  moderate:    { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',       accent: 'rgba(245,158,11,0.55)' },
  strong:      { badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',   accent: 'rgba(249,115,22,0.6)' },
  very_strong: { badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',              accent: 'rgba(239,68,68,0.6)' },
}

const LIFE_AREA_LABEL: Record<LifeArea, string> = {
  career: 'Career', wealth: 'Wealth', marriage: 'Marriage',
  education: 'Education', children: 'Children', health: 'Health',
  family: 'Family', spirituality: 'Spirituality', emotional_life: 'Emotional',
}

interface DoshaCardProps {
  dosha: DoshaResult
  defaultExpanded?: boolean
  isLocked?: boolean
  onSignIn?: () => void
}

export function DoshaCard({ dosha, defaultExpanded = false, isLocked = false, onSignIn }: DoshaCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'chart' | 'about'>('chart')
  const [techOpen, setTechOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const meaning = DOSHA_MEANINGS[dosha.id]
  const severity = dosha.severity ?? 'mild'
  const styles = SEVERITY_STYLES[severity]

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.08)'}`,
        borderLeft: `3px solid ${styles.accent}`,
      }}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full text-left px-4 py-3.5"
        onClick={() => isLocked ? onSignIn?.() : setExpanded(v => !v)}
      >
        {/* Row 1: name + severity badge + chevron */}
        <div className="flex items-center gap-2 mb-1">
          {dosha.currentlyActive && (
            <span className="shrink-0 inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
          <span className="font-semibold text-sm leading-snug flex-1 min-w-0" style={{ color: 'var(--text)' }}>
            {dosha.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
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
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-200"
              style={{ color: 'var(--text3)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </div>

        {/* Row 2: preview + life area chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {!expanded && meaning && (
            <p className="text-xs flex-1 min-w-0 truncate" style={{ color: 'var(--text3)' }}>
              {meaning.whatItMeans.split('\n\n')[0].slice(0, 120)}
              {meaning.whatItMeans.length > 120 ? '…' : ''}
            </p>
          )}
          {dosha.lifeAreas.slice(0, 3).map(area => (
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
                {tab === 'chart' ? 'Your Chart' : 'About this dosha'}
              </button>
            ))}
          </div>

          {/* Your Chart tab */}
          {activeTab === 'chart' && (
            <div className="space-y-2.5">
              {(dosha.chartNarrative || dosha.technicalReason) ? (
                (dosha.chartNarrative ?? dosha.technicalReason).split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{para}</p>
                ))
              ) : (
                <p className="text-sm" style={{ color: 'var(--text3)' }}>Analysis not available for this dosha.</p>
              )}
            </div>
          )}

          {/* About this dosha tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <DetailRow label="What it shows" text={meaning.whatItMeans} />
              <DetailRow label="What reduces it" text={meaning.whatReducesIt} />
              <DetailRow label="How to read it" text={meaning.guidance} />
            </div>
          )}

          {/* Technical details */}
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
                  technicalReason={dosha.technicalReason}
                  planetsInvolved={dosha.planetsInvolved}
                  housesInvolved={dosha.housesInvolved}
                  scoreBreakdown={dosha.scoreBreakdown}
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
