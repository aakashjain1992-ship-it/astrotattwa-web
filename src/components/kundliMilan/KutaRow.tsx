'use client'

import { useState } from 'react'
import type { KutaResult } from '@/lib/astrology/kundliMilan/types'

const KUTA_WEIGHTS: Record<string, string> = {
  Varna: '1',
  Vashya: '2',
  Tara: '3',
  Yoni: '4',
  'Graha Maitri': '5',
  Gana: '6',
  Bhakoot: '7',
  Nadi: '8',
}

export default function KutaRow({ kuta }: { kuta: KutaResult }) {
  const [expanded, setExpanded] = useState(false)
  const pct = (kuta.score / kuta.max) * 100
  const barColor =
    pct === 100 ? '#22c55e' :
    pct >= 60   ? '#3b82f6' :
    pct >= 30   ? '#f59e0b' :
                  '#ef4444'

  return (
    <div style={{
      padding: '16px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Summary row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr 64px',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Name + weight */}
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            {kuta.name}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
            max {KUTA_WEIGHTS[kuta.name] ?? kuta.max} pts
          </p>
        </div>

        {/* Bar + description */}
        <div>
          <div style={{ height: 7, borderRadius: 99, background: 'var(--border)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 99,
              background: barColor,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text2)', margin: 0, lineHeight: 1.4 }}>
            {kuta.description}
            {kuta.note && (
              <span style={{ marginLeft: 6, fontSize: 11.5, fontWeight: 600, color: '#ef4444' }}>
                ⚠ {kuta.note}
              </span>
            )}
          </p>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: barColor }}>
            {kuta.score}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>/{kuta.max}</span>
        </div>
      </div>

      {/* Expand toggle */}
      {kuta.detail && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--blue)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {expanded ? '▲ Less detail' : '▼ More detail'}
        </button>
      )}

      {/* Expanded detail */}
      {expanded && kuta.detail && (
        <div style={{
          marginTop: 16,
          padding: '20px',
          borderRadius: 12,
          background: 'hsl(var(--muted)/0.5)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* About */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', margin: '0 0 6px' }}>
              What is {kuta.name}?
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text2)', margin: 0, lineHeight: 1.7 }}>
              {kuta.detail.about}
            </p>
          </div>

          {/* Per-person grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', margin: '0 0 6px' }}>
                In your chart
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                {kuta.detail.person1}
              </p>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', margin: '0 0 6px' }}>
                In partner's chart
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
                {kuta.detail.person2}
              </p>
            </div>
          </div>

          {/* Meaning */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: pct === 0 ? 'rgba(239,68,68,0.07)' : pct >= 60 ? 'rgba(34,197,94,0.07)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${pct === 0 ? 'rgba(239,68,68,0.2)' : pct >= 60 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', margin: '0 0 6px' }}>
              What this means for you
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>
              {kuta.detail.meaning}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
