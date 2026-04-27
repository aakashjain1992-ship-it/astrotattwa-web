'use client'

import type { LifeAreaImpact as LifeAreaImpactData } from '@/lib/astrology/yogas/types'

interface LifeAreaImpactProps {
  areas: LifeAreaImpactData[]
}

const AREA_LABELS: Record<string, string> = {
  career: 'Career',
  wealth: 'Wealth',
  marriage: 'Relationships',
  education: 'Education',
  children: 'Children',
  health: 'Health',
  family: 'Family',
  spirituality: 'Spirituality',
  emotional_life: 'Emotional Life',
}

const LEVEL_CONFIG: Record<string, { label: string; barColor: string; textClass: string }> = {
  strong_support:   { label: 'Strong support',   barColor: '#10b981', textClass: 'text-emerald-600 dark:text-emerald-400' },
  good_support:     { label: 'Good support',      barColor: '#34d399', textClass: 'text-emerald-500 dark:text-emerald-300' },
  moderate_support: { label: 'Moderate support',  barColor: '#6ee7b7', textClass: 'text-emerald-400 dark:text-emerald-200' },
  neutral:          { label: 'Neutral',            barColor: '#94a3b8', textClass: 'text-slate-400 dark:text-slate-500' },
  needs_effort:     { label: 'Needs effort',       barColor: '#f59e0b', textClass: 'text-amber-600 dark:text-amber-400' },
  challenging:      { label: 'Challenging',        barColor: '#f97316', textClass: 'text-orange-600 dark:text-orange-400' },
}

export function LifeAreaImpact({ areas }: LifeAreaImpactProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Life Area Impact</h3>
      <div className="rounded-xl overflow-hidden" style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
        {areas.map((area, idx) => {
          const config = LEVEL_CONFIG[area.level] ?? LEVEL_CONFIG.neutral
          const barWidth = Math.min(100, Math.max(0, Math.abs(area.netScore)))
          return (
            <div
              key={area.area}
              className="px-4 py-3"
              style={{ borderBottom: idx < areas.length - 1 ? '1px solid var(--border)' : undefined }}
            >
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {AREA_LABELS[area.area] ?? area.area}
                </span>
                <span className={`text-xs font-medium shrink-0 ${config.textClass}`}>{config.label}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barWidth}%`, background: config.barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
