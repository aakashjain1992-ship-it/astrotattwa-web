'use client'

import { useTheme } from '@/components/theme-provider'
import type { SpecialCondition } from '@/types/numerology'

interface SpecialConditionsProps {
  conditions: SpecialCondition[]
}

const CONDITION_STYLE: Record<SpecialCondition['type'], { color: string; bg: string; icon: string }> = {
  'five-missing':     { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   icon: '⚠' },
  'five-repeated':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  icon: '⚡' },
  'corners-unstable': { color: '#f97316', bg: 'rgba(249,115,22,0.06)',  icon: '◈' },
  'corners-strong':   { color: '#10b981', bg: 'rgba(16,185,129,0.06)',  icon: '◆' },
}

export function SpecialConditions({ conditions }: SpecialConditionsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (conditions.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {conditions.map((condition) => {
        const style = CONDITION_STYLE[condition.type]
        return (
          <div
            key={condition.type}
            style={{
              border: `1.5px solid ${style.color}`,
              borderRadius: 12,
              padding: '18px 20px',
              background: style.bg,
              display: 'flex',
              gap: 14,
            }}
          >
            <div style={{
              fontSize: 20,
              color: style.color,
              flexShrink: 0,
              marginTop: 2,
            }}>
              {style.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: style.color, margin: '0 0 6px' }}>
                {condition.title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                {condition.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
