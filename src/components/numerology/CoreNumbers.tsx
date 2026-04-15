'use client'

import { NUMBER_MEANINGS, MASTER_NUMBER_MEANINGS } from '@/lib/numerology/meanings'
import type { NumerologyResult } from '@/types/numerology'

interface CoreNumbersProps {
  result: NumerologyResult
}

interface NumberBadgeProps {
  label: string
  number: number
  description: string
  color: string
  bgColor: string
}

function NumberBadge({ label, number, description, color, bgColor }: NumberBadgeProps) {
  const isMaster = [11, 22, 33].includes(number)
  const meaning = isMaster ? MASTER_NUMBER_MEANINGS[number] : NUMBER_MEANINGS[number]

  return (
    <div style={{
      background: bgColor,
      border: `1.5px solid ${color}`,
      borderRadius: 16,
      padding: '24px 28px',
      flex: 1,
      minWidth: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 6 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1 }}>{number}</span>
          {isMaster && (
            <span style={{ fontSize: 11, fontWeight: 700, color, opacity: 0.7, letterSpacing: '0.05em' }}>
              MASTER
            </span>
          )}
        </div>
      </div>

      {meaning && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {isMaster ? (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                {'title' in meaning ? meaning.title : ''}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                {'detail' in meaning ? meaning.detail : ''}
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: color,
                  color: '#fff',
                  letterSpacing: '0.05em',
                }}>
                  {'planet' in meaning ? meaning.planet : ''}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {'element' in meaning ? meaning.element : ''}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
                {description}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function CoreNumbers({ result }: CoreNumbersProps) {
  const lpMeaning = NUMBER_MEANINGS[result.lifePathNumber]
  const dnMeaning = NUMBER_MEANINGS[result.destinyNumber]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <NumberBadge
        label="Life Path Number"
        number={result.lifePathNumber}
        description={lpMeaning ? lpMeaning.trait : ''}
        color="var(--blue)"
        bgColor="rgba(59,130,246,0.06)"
      />
      <NumberBadge
        label="Destiny Number"
        number={result.destinyNumber}
        description={dnMeaning ? dnMeaning.trait : ''}
        color="hsl(280, 70%, 55%)"
        bgColor="rgba(140,70,220,0.06)"
      />
    </div>
  )
}
