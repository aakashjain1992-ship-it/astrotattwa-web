'use client'

import { useTheme } from '@/components/theme-provider'
import type { AshtakavargaResult } from '@/lib/astrology/ashtakavarga'
import { SIGN_NAMES } from '@/lib/astrology/ashtakavarga'

const GLYPH: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
}

// Short 2-letter sign abbreviations
const SIGN_SHORT: string[] = [
  'Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi',
  'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi',
]

const SARVA_STRENGTH_BADGE: Record<string, string> = {
  strong:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  weak:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

interface AshtakavargaTableProps {
  data: AshtakavargaResult
}

export function AshtakavargaTable({ data }: AshtakavargaTableProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  function binduBg(b: number): string {
    if (b <= 2) return isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'
    if (b === 3) return 'transparent'
    if (b <= 5) return isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.10)'
    return isDark ? 'rgba(34,197,94,0.22)' : 'rgba(34,197,94,0.18)'
  }

  function binduColor(b: number): string {
    if (b <= 2) return isDark ? 'rgba(252,165,165,1)' : 'rgba(185,28,28,1)'
    if (b >= 4) return isDark ? 'rgba(134,239,172,1)' : 'rgba(21,128,61,1)'
    return isDark ? 'rgba(203,213,225,1)' : 'rgba(71,85,105,1)'
  }

  const sarvaRowBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,17,23,0.04)'

  return (
    <div className="space-y-6">
      {/* ─── Section 1: Bhinnashtakavarga ─── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            Bhinnashtakavarga — Individual Planet Tables
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            Each cell shows bindus (0–8). 4+ bindus = favorable transit zone for that planet.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: 'hsl(var(--muted))' }}>
                <th className="text-left px-4 py-2 font-medium sticky left-0 z-10" style={{ color: 'var(--text2)', background: 'hsl(var(--muted))' }}>
                  Planet
                </th>
                {SIGN_SHORT.map((s) => (
                  <th
                    key={s}
                    className="text-center px-2 py-2 font-medium min-w-[2rem]"
                    style={{ color: 'var(--text2)' }}
                  >
                    {s}
                  </th>
                ))}
                <th className="text-center px-3 py-2 font-medium" style={{ color: 'var(--text2)' }}>
                  Total
                </th>
                <th className="text-center px-3 py-2 font-medium" style={{ color: 'var(--text2)' }}>
                  Good
                </th>
              </tr>
            </thead>
            <tbody>
              {data.bhinnashtakavarga.map((row, idx) => {
                const rowBg = idx % 2 === 0 ? 'hsl(var(--card))' : 'hsl(var(--muted) / 0.4)'
                return (
                  <tr key={row.planet} style={{ background: rowBg }}>
                    <td className="px-4 py-2 sticky left-0 z-10" style={{ background: rowBg }}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none">{GLYPH[row.planet] ?? ''}</span>
                        <span className="font-medium" style={{ color: 'var(--text)' }}>{row.planet}</span>
                      </div>
                    </td>
                    {row.bindus.map((b, i) => (
                      <td
                        key={i}
                        className="text-center px-1 py-1.5"
                        style={{ background: binduBg(b) }}
                      >
                        <span
                          className="font-medium tabular-nums"
                          style={{ color: binduColor(b) }}
                        >
                          {b}
                        </span>
                      </td>
                    ))}
                    <td className="text-center px-3 py-2 font-semibold tabular-nums" style={{ color: 'var(--text)' }}>
                      {row.total}
                    </td>
                    <td className="text-center px-3 py-2 tabular-nums" style={{ color: 'var(--text2)' }}>
                      {row.goodSignCount}
                    </td>
                  </tr>
                )
              })}

              {/* Sarvashtakavarga total row */}
              <tr style={{ background: sarvaRowBg, borderTop: '1px solid var(--border)' }}>
                <td className="px-4 py-2 sticky left-0 z-10 font-semibold" style={{ background: sarvaRowBg, color: 'var(--text)' }}>
                  Sarva
                </td>
                {data.sarvashtakavarga.map((b, i) => {
                  // Sarva uses its own thresholds: ≥28=strong(green), 25-27=moderate(amber), <25=weak(red)
                  const sarvaStrength = data.signStrengths[i]
                  const sarvaBg = sarvaStrength === 'strong'
                    ? (isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.14)')
                    : sarvaStrength === 'moderate'
                    ? (isDark ? 'rgba(251,191,36,0.18)' : 'rgba(251,191,36,0.14)')
                    : (isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.10)')
                  return (
                  <td
                    key={i}
                    className="text-center px-1 py-1.5"
                    style={{ background: sarvaBg }}
                  >
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: 'var(--text)' }}
                    >
                      {b}
                    </span>
                  </td>
                  )
                })}
                <td className="text-center px-3 py-2 font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                  {data.sarvaTotal}
                </td>
                <td className="text-center px-3 py-2" />
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
          Green = 4+ bindus (favorable). Red = 0–2 bindus (unfavorable). Total column = sum of all 12 signs.
        </div>
      </div>

      {/* ─── Section 2: Sarvashtakavarga Summary ─── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            Sarvashtakavarga — Transit Strength by Sign
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            Composite transit scores across all 7 planets. 28+ = strong, 25–27 = moderate, below 25 = weak.
          </p>
        </div>

        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {data.sarvashtakavarga.map((bindus, i) => {
            const strength = data.signStrengths[i]
            const badgeClass = SARVA_STRENGTH_BADGE[strength] ?? ''
            return (
              <div
                key={i}
                className="rounded-lg p-3 text-center"
                style={{
                  background: 'hsl(var(--muted) / 0.5)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--text2)' }}>
                  {SIGN_NAMES[i]}
                </div>
                <div className="text-2xl font-bold tabular-nums mb-1" style={{ color: 'var(--text)' }}>
                  {bindus}
                </div>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2.5 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
          Total sarvashtakavarga: {data.sarvaTotal} bindus (classical expected ~337).
        </div>
      </div>
    </div>
  )
}
