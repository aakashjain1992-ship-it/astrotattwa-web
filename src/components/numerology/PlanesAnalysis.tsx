'use client'

import { useTheme } from '@/components/theme-provider'
import { PLANE_GUIDANCE } from '@/lib/numerology/meanings'
import type { PlaneResult, PlaneStrength } from '@/types/numerology'

interface PlanesAnalysisProps {
  planes: PlaneResult[]
}

const STRENGTH_CONFIG: Record<PlaneStrength, { color: string; bg: string; label: string; bar: number }> = {
  Strong:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Strong',     bar: 100 },
  Moderate:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moderate',   bar: 67  },
  Weak:        { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'Weak',       bar: 33  },
  'Very Weak': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Very Weak',  bar: 0   },
}

function getGuidance(planeName: string, strength: PlaneStrength): string {
  const guidance = PLANE_GUIDANCE[planeName]
  if (!guidance) return ''
  if (strength === 'Strong') return guidance.strong
  if (strength === 'Moderate') return guidance.moderate
  if (strength === 'Weak') return guidance.weak
  return guidance.veryWeak
}

function PlaneCard({ plane }: { plane: PlaneResult }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const config = STRENGTH_CONFIG[plane.strength]
  const guidance = getGuidance(plane.name, plane.strength)
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.1)'

  return (
    <div style={{
      border: `1.5px solid ${borderColor}`,
      borderRadius: 12,
      padding: '18px 20px',
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{plane.name}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '1px 6px',
              borderRadius: 20,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.06)',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}>
              {plane.type}
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{plane.description}</p>
        </div>
        <div style={{
          background: config.bg,
          border: `1px solid ${config.color}`,
          borderRadius: 8,
          padding: '4px 10px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: config.color, margin: 0 }}>{config.label}</p>
          <p style={{ fontSize: 10, color: config.color, opacity: 0.7, margin: 0 }}>
            {plane.presentCount}/3 present
          </p>
        </div>
      </div>

      {/* Number pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {plane.numbers.map((n) => {
          // We don't have direct freq here, use presentCount logic
          return (
            <span
              key={n}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: config.bg,
                border: `1px solid ${config.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: config.color,
              }}
            >
              {n}
            </span>
          )
        })}
      </div>

      {/* Strength bar */}
      <div style={{ marginBottom: guidance ? 12 : 0 }}>
        <div style={{
          height: 4,
          borderRadius: 4,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(plane.presentCount / 3) * 100}%`,
            height: '100%',
            background: config.color,
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Guidance text */}
      {guidance && (
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0, marginTop: 10 }}>
          {guidance}
        </p>
      )}
    </div>
  )
}

export function PlanesAnalysis({ planes }: PlanesAnalysisProps) {
  const horizontal = planes.filter((p) => p.type === 'horizontal')
  const vertical = planes.filter((p) => p.type === 'vertical')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
          Horizontal Planes
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {horizontal.map((plane) => <PlaneCard key={plane.name} plane={plane} />)}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
          Vertical Planes
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vertical.map((plane) => <PlaneCard key={plane.name} plane={plane} />)}
        </div>
      </div>
    </div>
  )
}
