'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ShadbalaResult, PlanetShadbala } from '@/lib/astrology/shadbala'

const GLYPH: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
}

const STRENGTH_BADGE: Record<string, string> = {
  strong:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  adequate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  weak:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

interface ShadbalaTableProps {
  data: ShadbalaResult
}

function fmt(n: number): string {
  return n.toFixed(1)
}

export function ShadbalaTable({ data }: ShadbalaTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(planet: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(planet)) {
        next.delete(planet)
      } else {
        next.add(planet)
      }
      return next
    })
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          Shadbala — Planetary Strength
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
          Classical six-component strength system. A planet meeting its required minimum delivers its results fully.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'hsl(var(--muted))' }}>
              <th className="text-left px-4 py-2.5 font-medium" style={{ color: 'var(--text2)' }}>
                Planet
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Sthana
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Dig
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Kala
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Chesta
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Naisargika
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Drik
              </th>
              <th className="text-right px-3 py-2.5 font-medium font-semibold" style={{ color: 'var(--text)' }}>
                Total
              </th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell" style={{ color: 'var(--text2)' }}>
                Required
              </th>
              <th className="text-right px-4 py-2.5 font-medium" style={{ color: 'var(--text2)' }}>
                Strength
              </th>
            </tr>
          </thead>
          <tbody>
            {data.planets.map((p: PlanetShadbala, idx: number) => {
              const isExpanded = expanded.has(p.planet)
              const rowBg = idx % 2 === 0 ? 'hsl(var(--card))' : 'hsl(var(--muted) / 0.4)'

              return (
                <React.Fragment key={p.planet}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    style={{ background: rowBg, cursor: 'pointer' }}
                    onClick={() => toggle(p.planet)}
                  >
                    {/* Planet */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{GLYPH[p.planet] ?? ''}</span>
                        <span className="font-medium" style={{ color: 'var(--text)' }}>{p.planet}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand Sthana sub-scores'}
                          onClick={(e) => { e.stopPropagation(); toggle(p.planet) }}
                        >
                          {isExpanded
                            ? <ChevronDown className="h-3.5 w-3.5" />
                            : <ChevronRight className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </td>

                    {/* Sthana */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.sthanaBala.total)}
                    </td>

                    {/* Dig */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.digBala)}
                    </td>

                    {/* Kala */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.kalaBala.total)}
                    </td>

                    {/* Chesta */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.chestaBala)}
                    </td>

                    {/* Naisargika */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.naisargikaBala)}
                    </td>

                    {/* Drik */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {fmt(p.drikBala)}
                    </td>

                    {/* Total */}
                    <td className="text-right px-3 py-2.5 tabular-nums font-semibold" style={{ color: 'var(--text)' }}>
                      {fmt(p.total)}
                    </td>

                    {/* Required */}
                    <td className="text-right px-3 py-2.5 hidden sm:table-cell tabular-nums" style={{ color: 'var(--text2)' }}>
                      {p.requiredMinimum}
                    </td>

                    {/* Strength badge */}
                    <td className="text-right px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STRENGTH_BADGE[p.strengthLabel] ?? ''}`}
                      >
                        {p.strengthLabel.charAt(0).toUpperCase() + p.strengthLabel.slice(1)}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Sthana sub-row */}
                  {isExpanded && (
                    <tr key={`${p.planet}-sthana`} style={{ background: 'hsl(var(--muted) / 0.7)' }}>
                      <td colSpan={10} className="px-6 py-3">
                        <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text2)' }}>
                          Sthana Bala sub-components ({fmt(p.sthanaBala.total)} virupas total)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-1">
                          <div className="flex justify-between gap-2">
                            <span style={{ color: 'var(--text2)' }}>Uchcha</span>
                            <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{fmt(p.sthanaBala.ucchaBala)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span style={{ color: 'var(--text2)' }}>Saptavargaja</span>
                            <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{fmt(p.sthanaBala.saptavargajaBala)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span style={{ color: 'var(--text2)' }}>Ojayugma</span>
                            <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{fmt(p.sthanaBala.ojayugmaBala)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span style={{ color: 'var(--text2)' }}>Kendradi</span>
                            <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{fmt(p.sthanaBala.kendradiBala)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span style={{ color: 'var(--text2)' }}>Drekkana</span>
                            <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{fmt(p.sthanaBala.drekkanaBala)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
        All values in virupas. Click any row to expand Sthana Bala sub-components.
      </div>
    </div>
  )
}
