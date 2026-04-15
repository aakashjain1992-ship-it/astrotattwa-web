'use client'

import { useTheme } from '@/components/theme-provider'
import type { RajYoga } from '@/types/numerology'

interface RajYogasProps {
  yogas: RajYoga[]
}

export function RajYogas({ yogas }: RajYogasProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const activeYogas = yogas.filter((y) => y.active)
  const inactiveYogas = yogas.filter((y) => !y.active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {activeYogas.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>
            ★ Active Raj Yogas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeYogas.map((yoga) => <YogaCard key={yoga.name} yoga={yoga} isDark={isDark} />)}
          </div>
        </div>
      )}

      {inactiveYogas.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
            ○ Inactive Yogas (not formed)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inactiveYogas.map((yoga) => <YogaCard key={yoga.name} yoga={yoga} isDark={isDark} />)}
          </div>
        </div>
      )}

      {activeYogas.length === 0 && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(13,17,23,0.03)',
          border: `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(13,17,23,0.15)'}`,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0, textAlign: 'center' }}>
            No Raj Yogas are currently active. See inactive yogas below for growth pathways.
          </p>
        </div>
      )}
    </div>
  )
}

function YogaCard({ yoga, isDark }: { yoga: RajYoga; isDark: boolean }) {
  const activeStyle = {
    border: '1.5px solid rgba(245,158,11,0.5)',
    bg: 'rgba(245,158,11,0.06)',
    badge: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', text: 'Active' },
    numberBg: 'rgba(245,158,11,0.15)',
    numberColor: '#f59e0b',
  }
  const inactiveStyle = {
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.1)'}`,
    bg: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
    badge: { bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.06)', color: 'var(--text3)', text: 'Not Formed' },
    numberBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,23,0.06)',
    numberColor: 'var(--text3)',
  }

  const style = yoga.active ? activeStyle : inactiveStyle

  return (
    <div style={{
      border: style.border,
      borderRadius: 14,
      padding: '18px 20px',
      background: style.bg,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{yoga.name}</span>
            {yoga.altName && (
              <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>({yoga.altName})</span>
            )}
          </div>
          {/* Number combination */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {yoga.numbers.map((n, i) => (
              <span key={n}>
                <span style={{
                  display: 'inline-flex',
                  width: 26,
                  height: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  background: style.numberBg,
                  fontSize: 12,
                  fontWeight: 700,
                  color: style.numberColor,
                  border: `1px solid ${style.numberColor}`,
                }}>
                  {n}
                </span>
                {i < 2 && <span style={{ fontSize: 11, color: 'var(--text3)', margin: '0 2px' }}>+</span>}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          background: style.badge.bg,
          borderRadius: 20,
          padding: '4px 12px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: style.badge.color }}>
            {yoga.active ? '★ ' : ''}{style.badge.text}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
        {yoga.meaning}
      </p>
    </div>
  )
}
