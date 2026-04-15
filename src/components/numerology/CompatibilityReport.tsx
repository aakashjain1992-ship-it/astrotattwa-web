'use client'

import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import type { CompatibilityResult } from '@/types/numerology'
import { CompatibilityScore } from './CompatibilityScore'
import { GridComparison } from './GridComparison'
import { CompatibilityArrows } from './CompatibilityArrows'
import { CompatibilityYogas } from './CompatibilityYogas'
import { NumerologyReport } from './NumerologyReport'

interface CompatibilityReportProps {
  result: CompatibilityResult
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}

type TabId = 'overview' | 'grids' | 'grid-analysis' | 'arrows' | 'yogas'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',      label: 'Overview' },
  { id: 'grids',         label: 'Full Reports' },
  { id: 'grid-analysis', label: 'Grid Analysis' },
  { id: 'arrows',        label: 'Arrows & Planes' },
  { id: 'yogas',         label: 'Raj Yogas' },
]

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

export function CompatibilityReport({ result, onSave, saving, saved }: CompatibilityReportProps) {
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

  const scoreLabel =
    result.overallScore >= 80 ? 'Harmonious' :
    result.overallScore >= 65 ? 'Compatible' :
    result.overallScore >= 50 ? 'Neutral' :
    'Challenging'

  const scoreLabelColor =
    result.overallScore >= 80 ? '#10b981' :
    result.overallScore >= 65 ? 'var(--blue)' :
    result.overallScore >= 50 ? '#f59e0b' :
    '#ef4444'

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
            {result.person1.name} + {result.person2.name}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 4px' }}>
            {formatDob(result.person1.dob)} · {formatDob(result.person2.dob)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '2px 10px', borderRadius: 20,
              background: `${scoreLabelColor}20`,
              color: scoreLabelColor,
              border: `1px solid ${scoreLabelColor}50`,
            }}>
              {scoreLabel}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: scoreLabelColor }}>
              {result.overallScore}/100
            </span>
          </div>
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
          <div>
            <SectionTitle>Compatibility Overview</SectionTitle>
            <CompatibilityScore result={result} />
          </div>
        )}

        {activeTab === 'grids' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <SectionTitle>{result.person1.name}'s Reading</SectionTitle>
              <NumerologyReport result={result.person1} />
            </div>
            <div style={{ borderTop: `2px solid ${borderColor}`, paddingTop: 24 }}>
              <SectionTitle>{result.person2.name}'s Reading</SectionTitle>
              <NumerologyReport result={result.person2} />
            </div>
          </div>
        )}

        {activeTab === 'grid-analysis' && (
          <div>
            <SectionTitle>Grid Analysis</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Comparing the two Lo Shu Grids reveals which energies you share, which ones you each uniquely bring, and where you both have blind spots. Complementary grids create balanced partnerships.
            </p>
            <GridComparison
              person1={result.person1}
              person2={result.person2}
              gridCompatibility={result.gridCompatibility}
            />
          </div>
        )}

        {activeTab === 'arrows' && (
          <div>
            <SectionTitle>Arrows & Planes Analysis</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Arrows are formed when all three numbers in a line are present (strength) or absent (challenge). Plane strength shows how each dimension of life — mental, emotional, physical — compares between partners.
            </p>
            <CompatibilityArrows result={result} />
          </div>
        )}

        {activeTab === 'yogas' && (
          <div>
            <SectionTitle>Raj Yoga Compatibility</SectionTitle>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Raj Yogas are four exceptional combinations in Lo Shu numerology indicating areas of natural mastery. When both partners share an active yoga, that energy is powerfully amplified in the relationship.
            </p>
            <CompatibilityYogas result={result} />
          </div>
        )}
      </div>
    </div>
  )
}
