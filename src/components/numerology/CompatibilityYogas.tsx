'use client'

import { useTheme } from '@/components/theme-provider'
import type { CompatibilityResult } from '@/types/numerology'

interface CompatibilityYogasProps {
  result: CompatibilityResult
}

export function CompatibilityYogas({ result }: CompatibilityYogasProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'

  const { yogaCompatibility, person1, person2 } = result
  const { bothActive, p1Only, p2Only, alignmentScore } = yogaCompatibility

  // All 4 raj yoga definitions for display
  const ALL_YOGAS = [
    { name: "Willpower Raj Yoga",  numbers: [1,5,9] },
    { name: "Silver Raj Yoga",     numbers: [2,5,8] },
    { name: "Spiritual Raj Yoga",  numbers: [3,5,7] },
    { name: "Golden Raj Yoga",     numbers: [4,5,6] },
  ]

  const active1 = new Set(person1.rajYogas.filter((y) => y.active).map((y) => y.name))
  const active2 = new Set(person2.rajYogas.filter((y) => y.active).map((y) => y.name))

  // LP compatibility number context
  const lpPair = result.lpCompatibility

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Yoga alignment score header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', margin: '0 0 4px' }}>
            Raj Yoga Alignment
          </p>
          <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
            {bothActive.length > 0
              ? `Both carry the ${bothActive.join(" & ")} — exceptional life-purpose alignment.`
              : p1Only.length === 0 && p2Only.length === 0
              ? "Neither person has an active Raj Yoga — you are on parallel growth journeys."
              : "Your active yogas are complementary — different strengths, aligned purpose."}
          </p>
        </div>
        <span style={{
          fontSize: 22, fontWeight: 800,
          color: alignmentScore >= 70 ? '#10b981' : alignmentScore >= 40 ? 'var(--blue)' : '#f59e0b',
        }}>
          {alignmentScore}/100
        </span>
      </div>

      {/* Yoga cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_YOGAS.map(({ name, numbers }) => {
          const has1 = active1.has(name)
          const has2 = active2.has(name)
          const both = has1 && has2
          const neither = !has1 && !has2

          const yoga1 = person1.rajYogas.find((y) => y.name === name)
          const yoga2 = person2.rajYogas.find((y) => y.name === name)

          const borderC = both
            ? 'rgba(16,185,129,0.35)'
            : (has1 || has2)
            ? 'rgba(59,130,246,0.25)'
            : borderColor

          const bgC = both
            ? 'rgba(16,185,129,0.05)'
            : (has1 || has2)
            ? 'rgba(59,130,246,0.03)'
            : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(13,17,23,0.01)'

          return (
            <div key={name} style={{
              padding: '18px 20px',
              border: `1.5px solid ${borderC}`,
              borderRadius: 12,
              background: bgC,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{name}</p>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {numbers.map((n) => (
                      <span key={n} style={{
                        width: 22, height: 22, borderRadius: 4,
                        background: 'rgba(128,128,128,0.1)',
                        border: '1px solid rgba(128,128,128,0.2)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                      }}>{n}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: person1.name.split(' ')[0], active: has1, color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
                    { label: person2.name.split(' ')[0], active: has2, color: '#a78bfa', bg: 'rgba(140,70,220,0.1)' },
                  ].map(({ label, active, color, bg }) => (
                    <span key={label} style={{
                      fontSize: 11, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20,
                      background: active ? bg : 'transparent',
                      color: active ? color : 'var(--text3)',
                      border: `1px solid ${active ? color : 'rgba(128,128,128,0.2)'}`,
                      opacity: active ? 1 : 0.5,
                    }}>
                      {label}: {active ? "Active" : "Inactive"}
                    </span>
                  ))}
                </div>
              </div>

              {both && yoga1 && (
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: '#10b981' }}>Shared yoga — </strong>{yoga1.activeMeaning || yoga1.meaning}
                </p>
              )}
              {has1 && !has2 && yoga1 && (
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: 'var(--blue)' }}>{person1.name.split(' ')[0]} — </strong>{yoga1.activeMeaning || yoga1.meaning}
                </p>
              )}
              {has2 && !has1 && yoga2 && (
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: '#a78bfa' }}>{person2.name.split(' ')[0]} — </strong>{yoga2.activeMeaning || yoga2.meaning}
                </p>
              )}
              {neither && (
                <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.65, margin: 0 }}>
                  Neither person carries this yoga — a shared area to develop.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Destiny number compatibility card */}
      <div style={{
        padding: '18px 20px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', margin: '0 0 12px' }}>
          Destiny Number Alignment — D{result.destinyCompatibility.n1} + D{result.destinyCompatibility.n2}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(140,70,220,0.1)', color: '#a78bfa',
            border: '1px solid rgba(140,70,220,0.3)',
          }}>
            {result.destinyCompatibility.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            Score: {result.destinyCompatibility.score}/100
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
          {result.destinyCompatibility.description}
        </p>
      </div>

    </div>
  )
}
