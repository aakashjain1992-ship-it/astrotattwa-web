'use client'

import { useTheme } from '@/components/theme-provider'
import type { SavedNumerologyReading, NumerologyResult } from '@/types/numerology'

interface SavedReadingsProps {
  readings: SavedNumerologyReading[]
  onSelect: (result: NumerologyResult, name: string, dob: string) => void
  onDelete: (id: string) => void
  deleting: string | null
}

function formatDob(dob: string): string {
  const [dd, mm, yyyy] = dob.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(dd)} ${months[parseInt(mm)-1]} ${yyyy}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function SavedReadings({ readings, onSelect, onDelete, deleting }: SavedReadingsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'

  if (readings.length === 0) return null

  return (
    <div style={{ marginTop: 8 }}>
      <p style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text3)',
        marginBottom: 12,
      }}>
        Saved Readings ({readings.length})
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {readings.map((reading) => (
          <div
            key={reading.id}
            style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {reading.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
                {formatDob(reading.dob)} · Saved {formatDate(reading.created_at)}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                  LP: <strong style={{ color: 'var(--blue)' }}>{reading.result_json.lifePathNumber}</strong>
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                  Destiny: <strong style={{ color: 'hsl(280,70%,55%)' }}>{reading.result_json.destinyNumber}</strong>
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                  Name: <strong style={{ color: '#d97706' }}>{reading.result_json.chaldean.reducedValue}</strong>
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onSelect(reading.result_json, reading.name, reading.dob)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--blue)',
                  background: 'rgba(59,130,246,0.1)',
                  color: 'var(--blue)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                View
              </button>
              <button
                onClick={() => onDelete(reading.id)}
                disabled={deleting === reading.id}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`,
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                  cursor: deleting === reading.id ? 'not-allowed' : 'pointer',
                  opacity: deleting === reading.id ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {deleting === reading.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
