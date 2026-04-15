'use client'

import { useTheme } from '@/components/theme-provider'
import type { Arrow } from '@/types/numerology'

interface ArrowsAnalysisProps {
  arrows: Arrow[]
}

export function ArrowsAnalysis({ arrows }: ArrowsAnalysisProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.1)'

  const presentArrows = arrows.filter((a) => a.present)
  const missingArrows = arrows.filter((a) => a.missing)
  const partialArrows = arrows.filter((a) => a.partial)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Present Arrows */}
      {presentArrows.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', marginBottom: 12 }}>
            ✦ Strong Arrows (all 3 present)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {presentArrows.map((arrow) => (
              <ArrowCard key={arrow.label} arrow={arrow} variant="present" borderColor={borderColor} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Partial Arrows */}
      {partialArrows.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>
            ◐ Partial Arrows (1–2 present)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {partialArrows.map((arrow) => (
              <ArrowCard key={arrow.label} arrow={arrow} variant="partial" borderColor={borderColor} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Missing Arrows */}
      {missingArrows.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 12 }}>
            ✕ Missing Arrows (all 3 absent)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missingArrows.map((arrow) => (
              <ArrowCard key={arrow.label} arrow={arrow} variant="missing" borderColor={borderColor} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {presentArrows.length === 0 && missingArrows.length === 0 && partialArrows.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic' }}>No arrow data available.</p>
      )}
    </div>
  )
}

function ArrowCard({
  arrow,
  variant,
  borderColor,
  isDark,
}: {
  arrow: Arrow
  variant: 'present' | 'missing' | 'partial'
  borderColor: string
  isDark: boolean
}) {
  const colors = {
    present: { border: '#10b981', bg: 'rgba(16,185,129,0.06)', icon: '→', iconColor: '#10b981' },
    partial: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', icon: '↗', iconColor: '#f59e0b' },
    missing: { border: '#ef4444', bg: 'rgba(239,68,68,0.06)', icon: '✕', iconColor: '#ef4444' },
  }
  const cfg = colors[variant]

  return (
    <div style={{
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 12,
      padding: '16px 18px',
      background: cfg.bg,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: arrow.meaning ? 10 : 0, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Number pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {arrow.numbers.map((n, i) => (
              <span key={n}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.06)',
                  border: `1px solid ${borderColor}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: cfg.iconColor,
                }}>
                  {n}
                </span>
                {i < 2 && <span style={{ fontSize: 10, color: 'var(--text3)', margin: '0 2px' }}>-</span>}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{arrow.label}</span>
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: cfg.iconColor,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,23,0.04)',
          border: `1px solid ${cfg.border}`,
          borderRadius: 6,
          padding: '3px 8px',
          whiteSpace: 'nowrap',
        }}>
          {variant === 'present' ? `All 3 present` : variant === 'partial' ? `${arrow.presentCount}/3 present` : 'All 3 absent'}
        </div>
      </div>
      {arrow.meaning && (
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
          {arrow.meaning}
        </p>
      )}
    </div>
  )
}
