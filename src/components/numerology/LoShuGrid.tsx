'use client'

import { useTheme } from '@/components/theme-provider'
import type { LoShuGrid as LoShuGridType } from '@/types/numerology'

interface LoShuGridProps {
  grid: LoShuGridType
  gridFrequency: Record<number, number>
  lifePathNumber: number
  destinyNumber: number
}

// Grid layout: row × col → actual number
const GRID_NUMS = [[4,9,2],[3,5,7],[8,1,6]]
const ROW_LABELS = ['Mental', 'Emotional', 'Physical']
const COL_LABELS = ['Practical', 'Willpower', 'Action']

// Reduce master numbers to single digit for grid position
function toGridDigit(n: number): number {
  if (n <= 9) return n
  return String(n).split('').map(Number).reduce((a, b) => a + b, 0)
}

export function LoShuGrid({ grid, gridFrequency, lifePathNumber, destinyNumber }: LoShuGridProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const cellBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,17,23,0.03)'
  const cellBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const emptyColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(13,17,23,0.15)'
  const labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,17,23,0.4)'

  const lpGridDigit = toGridDigit(lifePathNumber)
  const dnGridDigit = toGridDigit(destinyNumber)

  // 0 = Missing, 1 = Balanced, 2 = Strong, 3+ = Excess
  function digitColor(count: number): string {
    if (count >= 3) return isDark ? '#f97316' : '#ea580c'  // Excess — orange
    if (count === 2) return 'var(--blue)'                  // Strong — blue
    return isDark ? '#34d399' : '#059669'                  // Balanced — green
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      <p style={{ fontSize: 12, color: labelColor, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
        Lo Shu Grid
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

        {/* Row labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ROW_LABELS.map((label) => (
            <div key={label} style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
              <span style={{ fontSize: 10, color: labelColor, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* 3×3 grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', gap: 4 }}>
              {row.map((cell, colIdx) => {
                const num = GRID_NUMS[rowIdx][colIdx]
                const count = gridFrequency[num] ?? 0
                const hasDigit = count > 0
                const isLP = lpGridDigit === num
                const isDN = dnGridDigit === num
                // How many come from DOB vs LP/Destiny
                const lpContrib = isLP ? 1 : 0
                const dnContrib = isDN ? 1 : 0

                return (
                  <div
                    key={colIdx}
                    style={{
                      width: 72,
                      height: 72,
                      background: hasDigit ? cellBg : 'transparent',
                      border: `1.5px solid ${hasDigit ? digitColor(count) : cellBorder}`,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      opacity: hasDigit ? 1 : 0.5,
                    }}
                  >
                    {hasDigit ? (
                      <>
                        {/* Main digit display */}
                        <div style={{
                          fontSize: count >= 4 ? 10 : count >= 3 ? 12 : count === 2 ? 15 : 22,
                          fontWeight: 700,
                          color: digitColor(count),
                          lineHeight: 1.2,
                          letterSpacing: '0.05em',
                          textAlign: 'center',
                        }}>
                          {Array(count).fill(num).join(' ')}
                        </div>

                        {/* LP / Destiny badges */}
                        {(isLP || isDN) && (
                          <div style={{ display: 'flex', gap: 2, position: 'absolute', bottom: 4, left: 0, right: 0, justifyContent: 'center' }}>
                            {isLP && (
                              <span style={{
                                fontSize: 8, fontWeight: 800, letterSpacing: '0.04em',
                                padding: '1px 4px', borderRadius: 3,
                                background: 'rgba(59,130,246,0.2)', color: 'var(--blue)',
                                border: '1px solid rgba(59,130,246,0.4)',
                              }}>LP</span>
                            )}
                            {isDN && (
                              <span style={{
                                fontSize: 8, fontWeight: 800, letterSpacing: '0.04em',
                                padding: '1px 4px', borderRadius: 3,
                                background: 'rgba(140,70,220,0.2)', color: '#a78bfa',
                                border: '1px solid rgba(140,70,220,0.4)',
                              }}>D</span>
                            )}
                          </div>
                        )}

                        {/* Count badge */}
                        {count >= 2 && (
                          <div style={{
                            position: 'absolute', top: 4, right: 5,
                            fontSize: 9, color: digitColor(count), fontWeight: 700, opacity: 0.7,
                          }}>
                            ×{count}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: 18, color: emptyColor, fontWeight: 300 }}>{num}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Column labels */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 56 }}>
        {COL_LABELS.map((label) => (
          <div key={label} style={{ width: 72, textAlign: 'center', paddingTop: 4 }}>
            <span style={{ fontSize: 10, color: labelColor, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { color: emptyColor,                               label: 'Missing (0)' },
          { color: isDark ? '#34d399' : '#059669',           label: 'Balanced (1)' },
          { color: 'var(--blue)',                            label: 'Strong (2)' },
          { color: isDark ? '#f97316' : '#ea580c',           label: 'Excess (3+)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: labelColor }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: 'rgba(59,130,246,0.2)', color: 'var(--blue)', border: '1px solid rgba(59,130,246,0.4)' }}>LP</span>
          <span style={{ fontSize: 11, color: labelColor }}>Life Path</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: 'rgba(140,70,220,0.2)', color: '#a78bfa', border: '1px solid rgba(140,70,220,0.4)' }}>D</span>
          <span style={{ fontSize: 11, color: labelColor }}>Destiny</span>
        </div>
      </div>
    </div>
  )
}
