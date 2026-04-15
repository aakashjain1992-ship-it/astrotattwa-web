'use client'

import { useTheme } from '@/components/theme-provider'
import type { CompatibilityResult } from '@/types/numerology'

interface CompatibilityArrowsProps {
  result: CompatibilityResult
}

function ArrowBadge({
  label,
  type,
}: {
  label: string
  type: 'shared' | 'p1' | 'p2' | 'missing'
}) {
  const colors = {
    shared:  { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.4)',  text: '#10b981'          },
    p1:      { bg: 'rgba(59,130,246,0.1)',    border: 'rgba(59,130,246,0.4)',  text: 'var(--blue)'      },
    p2:      { bg: 'rgba(140,70,220,0.1)',    border: 'rgba(140,70,220,0.4)', text: '#a78bfa'          },
    missing: { bg: 'rgba(128,128,128,0.06)',  border: 'rgba(128,128,128,0.2)', text: 'var(--text3)'    },
  }
  const c = colors[type]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 20,
      border: `1px solid ${c.border}`,
      background: c.bg,
      fontSize: 12,
      fontWeight: 600,
      color: c.text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function PlaneBar({
  label,
  score1,
  score2,
  name1,
  name2,
  isDark,
  borderColor,
}: {
  label: string
  score1: number     // 0-3 (how many of 3 nums present)
  score2: number
  name1: string
  name2: string
  isDark: boolean
  borderColor: string
}) {
  function pct(n: number) { return Math.round((n / 3) * 100) }

  function barColor(n: number) {
    if (n === 3) return '#10b981'
    if (n === 2) return 'var(--blue)'
    if (n === 1) return '#f59e0b'
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.08)'
  }

  function strengthLabel(n: number) {
    if (n === 3) return 'Strong'
    if (n === 2) return 'Moderate'
    if (n === 1) return 'Weak'
    return 'Very Weak'
  }

  return (
    <div style={{
      padding: '14px 16px',
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{name1.split(' ')[0]}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: barColor(score1) }}>{strengthLabel(score1)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(128,128,128,0.1)' }}>
            <div style={{ height: '100%', width: `${pct(score1)}%`, borderRadius: 3, background: barColor(score1), transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{name2.split(' ')[0]}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: barColor(score2) }}>{strengthLabel(score2)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(128,128,128,0.1)' }}>
            <div style={{ height: '100%', width: `${pct(score2)}%`, borderRadius: 3, background: barColor(score2), transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompatibilityArrows({ result }: CompatibilityArrowsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'

  const { arrowCompatibility, person1, person2 } = result

  const { bothPresent, bothMissing, p1Only, p2Only, harmonyScore } = arrowCompatibility

  // Planes comparison: use planes array from each person
  const planeNames = person1.planes.map((p) => p.name)
  const p1PlaneMap: Record<string, number> = {}
  const p2PlaneMap: Record<string, number> = {}
  for (const p of person1.planes) p1PlaneMap[p.name] = p.presentCount
  for (const p of person2.planes) p2PlaneMap[p.name] = p.presentCount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Arrow overview */}
      <div style={{
        padding: '20px 24px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', margin: 0 }}>
            Arrow Harmony
          </p>
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: harmonyScore >= 70 ? '#10b981' : harmonyScore >= 50 ? 'var(--blue)' : '#f59e0b',
          }}>
            {harmonyScore}/100
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bothPresent.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#10b981', fontWeight: 600, margin: '0 0 6px' }}>Both carry — Shared Strengths</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {bothPresent.map((l) => <ArrowBadge key={l} label={l} type="shared" />)}
              </div>
            </div>
          )}
          {p1Only.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, margin: '0 0 6px' }}>{person1.name.split(' ')[0]} carries</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p1Only.map((l) => <ArrowBadge key={l} label={l} type="p1" />)}
              </div>
            </div>
          )}
          {p2Only.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, margin: '0 0 6px' }}>{person2.name.split(' ')[0]} carries</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p2Only.map((l) => <ArrowBadge key={l} label={l} type="p2" />)}
              </div>
            </div>
          )}
          {bothMissing.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, margin: '0 0 6px' }}>Neither carries — Shared Growth Area</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {bothMissing.map((l) => <ArrowBadge key={l} label={l} type="missing" />)}
              </div>
            </div>
          )}
          {bothPresent.length === 0 && p1Only.length === 0 && p2Only.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>
              Neither person carries any complete arrows. This is common — arrows require all three specific numbers to be present.
            </p>
          )}
        </div>
      </div>

      {/* Planes comparison */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>
          Plane Strength Comparison
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Horizontal Planes</p>
            {planeNames.filter((_, i) => person1.planes[i].type === 'horizontal').map((name) => (
              <PlaneBar
                key={name}
                label={name}
                score1={p1PlaneMap[name] ?? 0}
                score2={p2PlaneMap[name] ?? 0}
                name1={person1.name}
                name2={person2.name}
                isDark={isDark}
                borderColor={borderColor}
              />
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Vertical Planes</p>
            {planeNames.filter((_, i) => person1.planes[i].type === 'vertical').map((name) => (
              <PlaneBar
                key={name}
                label={name}
                score1={p1PlaneMap[name] ?? 0}
                score2={p2PlaneMap[name] ?? 0}
                name1={person1.name}
                name2={person2.name}
                isDark={isDark}
                borderColor={borderColor}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
