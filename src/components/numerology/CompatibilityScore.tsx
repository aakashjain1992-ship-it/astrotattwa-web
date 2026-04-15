'use client'

import { useTheme } from '@/components/theme-provider'
import type { CompatibilityResult } from '@/types/numerology'

interface CompatibilityScoreProps {
  result: CompatibilityResult
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)

  const color =
    score >= 80 ? '#10b981' :
    score >= 65 ? '#3b82f6' :
    score >= 50 ? '#f59e0b' :
    '#ef4444'

  return (
    <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={10} />
      <circle
        cx={64} cy={64} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={64} y={64}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={26}
        fontWeight={800}
        style={{ transform: 'rotate(90deg)', transformOrigin: '64px 64px', fontFamily: 'inherit' }}
      >
        {score}
      </text>
    </svg>
  )
}

function BreakdownBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {value}<span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(128,128,128,0.12)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: color,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

export function CompatibilityScore({ result }: CompatibilityScoreProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'

  const { overallScore, scoreBreakdown } = result

  const scoreLabel =
    overallScore >= 80 ? 'Harmonious' :
    overallScore >= 65 ? 'Compatible' :
    overallScore >= 50 ? 'Neutral' :
    'Challenging'

  const scoreBg =
    overallScore >= 80 ? 'rgba(16,185,129,0.08)' :
    overallScore >= 65 ? 'rgba(59,130,246,0.08)' :
    overallScore >= 50 ? 'rgba(245,158,11,0.08)' :
    'rgba(239,68,68,0.08)'

  const scoreBorder =
    overallScore >= 80 ? 'rgba(16,185,129,0.25)' :
    overallScore >= 65 ? 'rgba(59,130,246,0.25)' :
    overallScore >= 50 ? 'rgba(245,158,11,0.25)' :
    'rgba(239,68,68,0.25)'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>

      {/* Score ring */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px',
        border: `1.5px solid ${scoreBorder}`,
        borderRadius: 16,
        background: scoreBg,
        minWidth: 180,
      }}>
        <ScoreRing score={overallScore} />
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '12px 0 4px' }}>
          {scoreLabel}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, textAlign: 'center' }}>
          Compatibility Score
        </p>
      </div>

      {/* Breakdown */}
      <div style={{
        flex: 1,
        minWidth: 220,
        padding: '20px 24px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
          Score Breakdown
        </p>
        <BreakdownBar label="Life Path Harmony" value={scoreBreakdown.lifePath} max={30} color="var(--blue)" />
        <BreakdownBar label="Destiny Alignment" value={scoreBreakdown.destiny} max={20} color="hsl(280,70%,55%)" />
        <BreakdownBar label="Grid Balance" value={scoreBreakdown.grid} max={20} color="#10b981" />
        <BreakdownBar label="Arrow Harmony" value={scoreBreakdown.arrows} max={15} color="#f59e0b" />
        <BreakdownBar label="Raj Yoga Alignment" value={scoreBreakdown.yogas} max={15} color="#f97316" />
      </div>

      {/* LP Pair summary */}
      <div style={{
        padding: '20px 24px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
        minWidth: 220,
        flex: 1,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
          Core Numbers
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{result.person1.name.split(' ')[0]}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>LP {result.person1.lifePathNumber}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>D {result.person1.destinyNumber}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text3)', fontSize: 20 }}>♥</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{result.person2.name.split(' ')[0]}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'hsl(280,70%,55%)', lineHeight: 1 }}>LP {result.person2.lifePathNumber}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>D {result.person2.destinyNumber}</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
          {result.lpCompatibility.description}
        </p>
      </div>

      {/* Strengths & Challenges */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{
          flex: 1,
          minWidth: 220,
          padding: '20px 24px',
          border: '1.5px solid rgba(16,185,129,0.25)',
          borderRadius: 16,
          background: 'rgba(16,185,129,0.05)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', marginBottom: 12 }}>
            Shared Strengths
          </p>
          {result.strengths.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {result.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 6 }}>{s}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>Explore the tabs below for detailed analysis.</p>
          )}
        </div>

        <div style={{
          flex: 1,
          minWidth: 220,
          padding: '20px 24px',
          border: '1.5px solid rgba(245,158,11,0.25)',
          borderRadius: 16,
          background: 'rgba(245,158,11,0.05)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d97706', marginBottom: 12 }}>
            Growth Areas
          </p>
          {result.challenges.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {result.challenges.map((c, i) => (
                <li key={i} style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 6 }}>{c}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>Explore the tabs below for detailed analysis.</p>
          )}
        </div>
      </div>

      {/* Advice */}
      <div style={{
        width: '100%',
        padding: '20px 24px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
          Guidance
        </p>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>
          {result.advice}
        </p>
      </div>

    </div>
  )
}
