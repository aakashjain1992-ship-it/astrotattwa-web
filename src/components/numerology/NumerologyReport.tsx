'use client'

import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { NUMBER_MEANINGS } from '@/lib/numerology/meanings'
import type { NumerologyResult } from '@/types/numerology'
import { LoShuGrid } from './LoShuGrid'
import { CoreNumbers } from './CoreNumbers'
import { ChaldeanCard } from './ChaldeanCard'
import { PlanesAnalysis } from './PlanesAnalysis'
import { ArrowsAnalysis } from './ArrowsAnalysis'
import { RajYogas } from './RajYogas'
import { KarmicLessons } from './KarmicLessons'
import { SpecialConditions } from './SpecialConditions'

interface NumerologyReportProps {
  result: NumerologyResult
  /** Optional: show save button. Pass onSave handler if saving is supported. */
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}

type TabId = 'overview' | 'planes' | 'arrows' | 'yogas' | 'lessons' | 'numbers'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',  label: 'Overview' },
  { id: 'planes',    label: 'Planes' },
  { id: 'arrows',    label: 'Arrows' },
  { id: 'yogas',     label: 'Raj Yogas' },
  { id: 'lessons',   label: 'Karmic Lessons' },
  { id: 'numbers',   label: 'Numbers' },
]

/**
 * Full Lo Shu Grid report — reusable across pages.
 * Renders the complete analysis for a NumerologyResult.
 */
export function NumerologyReport({ result, onSave, saving, saved }: NumerologyReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const tabBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,17,23,0.03)'

  function formatDob(dob: string) {
    const [dd, mm, yyyy] = dob.split('-')
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    return `${parseInt(dd)} ${months[parseInt(mm)-1]} ${yyyy}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Report header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 16,
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            {result.name}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
            {formatDob(result.dob)} · Lo Shu Grid Analysis
          </p>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving || saved}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: 10,
              border: saved ? '1.5px solid #10b981' : '1.5px solid var(--blue)',
              background: saved ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
              color: saved ? '#10b981' : 'var(--blue)',
              cursor: saving || saved ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Reading'}
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                padding: '7px 14px',
                borderRadius: 8,
                border: isActive ? '1.5px solid var(--blue)' : `1px solid ${borderColor}`,
                background: isActive ? 'rgba(59,130,246,0.1)' : tabBg,
                color: isActive ? 'var(--blue)' : 'var(--text2)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Grid + Core Numbers side by side */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
              {/* Grid */}
              <div style={{
                padding: '24px',
                border: `1.5px solid ${borderColor}`,
                borderRadius: 16,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LoShuGrid
                  grid={result.grid}
                  gridFrequency={result.gridFrequency}
                  lifePathNumber={result.lifePathNumber}
                  destinyNumber={result.destinyNumber}
                />
              </div>

              {/* Summary stats */}
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SummaryStats result={result} isDark={isDark} borderColor={borderColor} />
              </div>
            </div>

            {/* Core numbers */}
            <CoreNumbers result={result} />

            {/* Chaldean */}
            <ChaldeanCard chaldean={result.chaldean} name={result.name} />

            {/* Special conditions */}
            {result.specialConditions.length > 0 && (
              <div>
                <SectionTitle>Special Conditions</SectionTitle>
                <SpecialConditions conditions={result.specialConditions} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'planes' && (
          <div>
            <SectionTitle>6-Plane Analysis</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              The Lo Shu Grid is analysed across six planes — three horizontal (Mental, Emotional, Physical) and three vertical (Practical, Willpower, Action). Each plane reveals the strength of a core life dimension based on which numbers are present.
            </p>
            <PlanesAnalysis planes={result.planes} />
          </div>
        )}

        {activeTab === 'arrows' && (
          <div>
            <SectionTitle>Arrows Analysis</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Arrows are formed when all three numbers in a row, column, or diagonal are present (strong arrow) or entirely absent (missing arrow). Each arrow carries a specific meaning about your core strengths and life challenges.
            </p>
            <ArrowsAnalysis arrows={result.arrows} />
          </div>
        )}

        {activeTab === 'yogas' && (
          <div>
            <SectionTitle>Raj Yogas</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Raj Yogas are four special number combinations in Lo Shu numerology that indicate areas of exceptional natural ability and life-path alignment. A yoga is active when all three of its numbers appear in your DOB.
            </p>
            <RajYogas yogas={result.rajYogas} />
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <SectionTitle>Karmic Lessons</SectionTitle>
            <KarmicLessons lessons={result.karmicLessons} />
          </div>
        )}

        {activeTab === 'numbers' && (
          <div>
            <SectionTitle>Number Meanings (1–9)</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Reference guide for all nine numbers in Lo Shu numerology — their planetary ruler, core qualities, and significance when present or missing in your grid.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4,5,6,7,8,9].map((n) => {
                const m = NUMBER_MEANINGS[n]
                const freq = result.gridFrequency[n] ?? 0
                const isPresent = freq > 0
                return (
                  <div
                    key={n}
                    style={{
                      border: `1.5px solid ${isPresent ? 'rgba(59,130,246,0.3)' : borderColor}`,
                      borderRadius: 12,
                      padding: '16px 18px',
                      background: isPresent
                        ? 'rgba(59,130,246,0.04)'
                        : isDark ? 'rgba(255,255,255,0.01)' : 'rgba(13,17,23,0.01)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: isPresent ? 'rgba(59,130,246,0.15)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,23,0.06)',
                        border: `1px solid ${isPresent ? 'var(--blue)' : borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 800,
                        color: isPresent ? 'var(--blue)' : 'var(--text3)',
                        flexShrink: 0,
                      }}>
                        {n}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.keyword}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                          }}>{m.planet}</span>
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{m.element}</span>
                          {freq > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                              background: 'rgba(16,185,129,0.1)', color: '#10b981',
                            }}>
                              {freq}× in grid
                            </span>
                          )}
                          {freq === 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            }}>
                              Missing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: '0 0 8px' }}>
                      {m.trait}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                      <strong style={{ color: 'var(--text)', fontStyle: 'normal' }}>Career: </strong>{m.career}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--text)',
      margin: '0 0 16px',
      paddingBottom: 10,
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </h3>
  )
}

function SummaryStats({
  result,
  isDark,
  borderColor,
}: {
  result: NumerologyResult
  isDark: boolean
  borderColor: string
}) {
  const stats = [
    { label: 'Life Path',      value: result.lifePathNumber,          color: 'var(--blue)' },
    { label: 'Destiny',        value: result.destinyNumber,           color: 'hsl(280,70%,55%)' },
    { label: 'Name Number',    value: result.chaldean.reducedValue,   color: '#d97706' },
    { label: 'Active Yogas',   value: result.rajYogas.filter(y => y.active).length, color: '#f59e0b', suffix: '/4' },
    { label: 'Missing Numbers',value: result.missingNumbers.length,   color: '#ef4444', suffix: '/9' },
    { label: 'Karmic Lessons', value: result.karmicLessons.length,    color: '#f97316', suffix: '' },
  ]

  return (
    <>
      {stats.map(({ label, value, color, suffix }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color }}>
            {value}{suffix ?? ''}
          </span>
        </div>
      ))}
    </>
  )
}
