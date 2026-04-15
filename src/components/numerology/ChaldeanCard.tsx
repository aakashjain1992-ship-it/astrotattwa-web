'use client'

import { useTheme } from '@/components/theme-provider'
import { NUMBER_MEANINGS, MASTER_NUMBER_MEANINGS } from '@/lib/numerology/meanings'
import type { ChaldeanResult } from '@/types/numerology'

interface ChaldeanCardProps {
  chaldean: ChaldeanResult
  name: string
}

export function ChaldeanCard({ chaldean, name }: ChaldeanCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const cellBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,17,23,0.04)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'

  const isMaster = [11, 22, 33].includes(chaldean.reducedValue)
  const meaning = isMaster
    ? MASTER_NUMBER_MEANINGS[chaldean.reducedValue]
    : NUMBER_MEANINGS[chaldean.reducedValue]

  // Group letters by word (space-separated parts of name)
  const words = name.trim().split(/\s+/)
  const letterGroups: { word: string; letters: { letter: string; value: number }[] }[] = []
  let idx = 0
  for (const word of words) {
    const letters: { letter: string; value: number }[] = []
    for (const ch of word) {
      if (/[a-zA-Z]/.test(ch) && idx < chaldean.letterBreakdown.length) {
        letters.push(chaldean.letterBreakdown[idx])
        idx++
      }
    }
    if (letters.length > 0) letterGroups.push({ word, letters })
  }

  return (
    <div style={{
      border: `1.5px solid ${borderColor}`,
      borderRadius: 16,
      padding: '24px',
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>
            Chaldean Name Numerology
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{name}</h3>
        </div>
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1.5px solid rgba(245,158,11,0.4)',
          borderRadius: 12,
          padding: '12px 20px',
          textAlign: 'center',
          minWidth: 80,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d97706', margin: 0 }}>
            Name Number
          </p>
          <p style={{ fontSize: 36, fontWeight: 800, color: '#d97706', margin: 0, lineHeight: 1.1 }}>
            {chaldean.reducedValue}
          </p>
          {isMaster && (
            <p style={{ fontSize: 9, fontWeight: 700, color: '#d97706', margin: 0, letterSpacing: '0.08em' }}>MASTER</p>
          )}
          {chaldean.totalValue !== chaldean.reducedValue && (
            <p style={{ fontSize: 10, color: 'var(--text3)', margin: 0 }}>Sum: {chaldean.totalValue}</p>
          )}
        </div>
      </div>

      {/* Letter breakdown */}
      <div style={{ marginBottom: 20 }}>
        {letterGroups.map(({ word, letters }) => (
          <div key={word} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              {word}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {letters.map(({ letter, value }, i) => (
                <div
                  key={i}
                  style={{
                    minWidth: 36,
                    background: cellBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 6,
                    padding: '6px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{letter}</div>
                  <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
              {/* Word total */}
              <div style={{
                minWidth: 36,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 6,
                padding: '6px 8px',
                textAlign: 'center',
                marginLeft: 4,
              }}>
                <div style={{ fontSize: 10, color: '#d97706', fontWeight: 600 }}>Σ</div>
                <div style={{ fontSize: 13, color: '#d97706', fontWeight: 800 }}>
                  {letters.reduce((s, l) => s + l.value, 0)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      {meaning && (
        <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
          {isMaster && 'title' in meaning ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{meaning.title}</p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{meaning.detail}</p>
            </>
          ) : 'planet' in meaning ? (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: 20,
                  background: '#d97706',
                  color: '#fff',
                }}>
                  {meaning.planet}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{meaning.element}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)' }}>{meaning.keyword}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                {meaning.trait}
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
