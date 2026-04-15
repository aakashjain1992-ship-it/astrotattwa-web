'use client'

import { useTheme } from '@/components/theme-provider'
import type { GridCompatibility, NumerologyResult } from '@/types/numerology'

interface GridComparisonProps {
  person1: NumerologyResult
  person2: NumerologyResult
  gridCompatibility: GridCompatibility
}

// Standard Lo Shu layout
const GRID_NUMS = [[4,9,2],[3,5,7],[8,1,6]]

function MiniGrid({
  gridFrequency,
  lifePathNumber,
  destinyNumber,
  label,
  color,
  isDark,
}: {
  gridFrequency: Record<number, number>
  lifePathNumber: number
  destinyNumber: number
  label: string
  color: string
  isDark: boolean
}) {
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const emptyColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(13,17,23,0.15)'
  const cellBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,17,23,0.03)'

  function toGridDigit(n: number): number {
    if (n <= 9) return n
    return String(n).split('').map(Number).reduce((a, b) => a + b, 0)
  }

  const lpDigit = toGridDigit(lifePathNumber)
  const dnDigit = toGridDigit(destinyNumber)

  function digitColor(count: number): string {
    if (count >= 3) return isDark ? '#f97316' : '#ea580c'
    if (count === 2) return 'var(--blue)'
    return isDark ? '#34d399' : '#059669'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {GRID_NUMS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 3 }}>
            {row.map((num, ci) => {
              const count = gridFrequency[num] ?? 0
              const hasDigit = count > 0
              const isLP = lpDigit === num
              const isDN = dnDigit === num
              return (
                <div
                  key={ci}
                  style={{
                    width: 52,
                    height: 52,
                    background: hasDigit ? cellBg : 'transparent',
                    border: `1.5px solid ${hasDigit ? digitColor(count) : borderColor}`,
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    opacity: hasDigit ? 1 : 0.4,
                  }}
                >
                  {hasDigit ? (
                    <>
                      <div style={{
                        fontSize: count >= 3 ? 9 : count === 2 ? 11 : 16,
                        fontWeight: 700,
                        color: digitColor(count),
                        lineHeight: 1.2,
                        textAlign: 'center',
                      }}>
                        {Array(count).fill(num).join(' ')}
                      </div>
                      {(isLP || isDN) && (
                        <div style={{ display: 'flex', gap: 1, position: 'absolute', bottom: 2 }}>
                          {isLP && (
                            <span style={{
                              fontSize: 6, fontWeight: 800,
                              padding: '1px 3px', borderRadius: 2,
                              background: 'rgba(59,130,246,0.2)', color: 'var(--blue)',
                            }}>LP</span>
                          )}
                          {isDN && (
                            <span style={{
                              fontSize: 6, fontWeight: 800,
                              padding: '1px 3px', borderRadius: 2,
                              background: 'rgba(140,70,220,0.2)', color: '#a78bfa',
                            }}>D</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: emptyColor, fontWeight: 300 }}>{num}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GridComparison({ person1, person2, gridCompatibility }: GridComparisonProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,17,23,0.4)'

  const { shared, missingInBoth, p1Only, p2Only, complementaryScore } = gridCompatibility

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Side-by-side mini grids */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32 }}>
        <MiniGrid
          gridFrequency={person1.gridFrequency}
          lifePathNumber={person1.lifePathNumber}
          destinyNumber={person1.destinyNumber}
          label={person1.name}
          color="var(--blue)"
          isDark={isDark}
        />
        <MiniGrid
          gridFrequency={person2.gridFrequency}
          lifePathNumber={person2.lifePathNumber}
          destinyNumber={person2.destinyNumber}
          label={person2.name}
          color="hsl(280,70%,55%)"
          isDark={isDark}
        />
      </div>

      {/* Analysis cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>

        {/* Shared numbers */}
        <div style={{
          flex: 1, minWidth: 160,
          padding: '16px 18px',
          border: '1.5px solid rgba(59,130,246,0.25)',
          borderRadius: 12,
          background: 'rgba(59,130,246,0.05)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 10px' }}>
            Shared ({shared.length})
          </p>
          {shared.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {shared.map((n) => (
                  <span key={n} style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--blue)',
                  }}>{n}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Shared strengths — energies you both naturally carry and reinforce in each other.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>No numbers shared — your grids are complementary.</p>
          )}
        </div>

        {/* Missing in both */}
        <div style={{
          flex: 1, minWidth: 160,
          padding: '16px 18px',
          border: '1.5px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          background: 'rgba(239,68,68,0.05)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444', margin: '0 0 10px' }}>
            Shared Blind Spots ({missingInBoth.length})
          </p>
          {missingInBoth.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {missingInBoth.map((n) => (
                  <span key={n} style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#ef4444',
                  }}>{n}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Neither carries these energies — a shared growth area to consciously develop together.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>No shared blind spots — great collective coverage!</p>
          )}
        </div>

        {/* P1 Only */}
        <div style={{
          flex: 1, minWidth: 160,
          padding: '16px 18px',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 10px' }}>
            {person1.name.split(' ')[0]} brings ({p1Only.length})
          </p>
          {p1Only.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {p1Only.map((n) => (
                  <span key={n} style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--blue)',
                  }}>{n}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Energies {person1.name.split(' ')[0]} carries that fill gaps in {person2.name.split(' ')[0]}'s grid.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>No unique numbers to offer.</p>
          )}
        </div>

        {/* P2 Only */}
        <div style={{
          flex: 1, minWidth: 160,
          padding: '16px 18px',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(280,70%,55%)', margin: '0 0 10px' }}>
            {person2.name.split(' ')[0]} brings ({p2Only.length})
          </p>
          {p2Only.length > 0 ? (
            <>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {p2Only.map((n) => (
                  <span key={n} style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'rgba(140,70,220,0.1)',
                    border: '1px solid rgba(140,70,220,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#a78bfa',
                  }}>{n}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Energies {person2.name.split(' ')[0]} carries that fill gaps in {person1.name.split(' ')[0]}'s grid.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>No unique numbers to offer.</p>
          )}
        </div>

      </div>

      {/* Complementary score */}
      <div style={{
        padding: '16px 20px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ fontSize: 32, fontWeight: 800, color: complementaryScore >= 70 ? '#10b981' : complementaryScore >= 50 ? 'var(--blue)' : '#f59e0b' }}>
            {complementaryScore}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text3)' }}>/100</span>
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Grid Balance Score</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, maxWidth: 400 }}>
            Together you cover {new Set([...gridCompatibility.shared, ...p1Only, ...p2Only]).size} of the 9 numbers.
            {missingInBoth.length === 0 ? " Full collective coverage — excellent." : ` Numbers ${missingInBoth.join(", ")} remain a shared blind spot.`}
          </p>
        </div>
      </div>

    </div>
  )
}
