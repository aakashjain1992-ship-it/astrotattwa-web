'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { FestivalData } from '@/lib/panchang/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD = '#D4A017'
const GOLD_RGBA = (a: number) => `rgba(212,160,23,${a})`

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const EXCLUDED_TYPES = new Set(['purnima', 'amavasya'])

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  major:      { bg: GOLD_RGBA(.14),              text: GOLD,      label: 'Festival' },
  minor:      { bg: 'rgba(96,165,250,.12)',       text: '#60A5FA', label: 'Minor' },
  fast:       { bg: 'rgba(167,139,250,.12)',      text: '#A78BFA', label: 'Ekadashi' },
  auspicious: { bg: 'rgba(52,211,153,.12)',       text: '#34D399', label: 'Holiday' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateStr(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { year: y, month: m, day: d }
}

function getDow(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  return DAY_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FestivalCalendarSection() {
  const now          = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const today        = now.getDate()

  const [upcoming, setUpcoming] = useState<FestivalData[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`/api/festivals?year=${currentYear}&month=${currentMonth}`)
      .then(r => r.json())
      .then(data => {
        const fests: FestivalData[] = data.data?.festivals ?? []
        const filtered = fests
          .filter(f => !EXCLUDED_TYPES.has(f.type))
          .filter(f => parseDateStr(f.date).day >= today)
          .slice(0, 4)
        setUpcoming(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentYear, currentMonth, today])

  if (loading) return null

  return (
    <section style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 0',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 0%, ${GOLD_RGBA(.04)} 0%, transparent 55%)`,
      }} />

      <div
        className="fest-teaser-card"
        style={{
          width: 'min(1280px, calc(100% - 20px))', margin: '0 auto',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: '20px',
          padding: '40px 40px 36px',
          position: 'relative',
        }}
      >
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px', marginBottom: '28px',
        }}>
          <div>
            <p style={{
              fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase',
              color: GOLD, marginBottom: '8px', fontWeight: 500,
            }}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </p>
            <h3 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 400,
              color: 'rgba(255,255,255,.92)', margin: 0,
            }}>
              Upcoming Festivals
            </h3>
          </div>

          <Link
            href="/festival"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 22px', borderRadius: '10px',
              fontSize: '13.5px', fontWeight: 600,
              background: GOLD_RGBA(.14), border: `1px solid ${GOLD_RGBA(.35)}`,
              color: GOLD, textDecoration: 'none',
              transition: 'all .15s', flexShrink: 0, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = GOLD_RGBA(.24) }}
            onMouseLeave={e => { e.currentTarget.style.background = GOLD_RGBA(.14) }}
          >
            View Full Calendar →
          </Link>
        </div>

        {/* Festival rows */}
        {upcoming.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.3)' }}>
            No more festivals this month.{' '}
            <Link href="/festival" style={{ color: GOLD, textDecoration: 'none' }}>
              View full calendar →
            </Link>
          </p>
        ) : (
          upcoming.map(f => {
            const badge = TYPE_BADGE[f.type] ?? TYPE_BADGE.minor
            const { month, day } = parseDateStr(f.date)
            const dow = getDow(f.date)
            const mon = MONTH_NAMES[month - 1].slice(0, 3).toUpperCase()
            return (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
              }}>
                <div style={{ flexShrink: 0, width: '38px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: GOLD, opacity: .65, marginBottom: '1px' }}>{dow}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1, color: 'rgba(255,255,255,.88)' }}>{day}</div>
                  <div style={{ fontSize: '9px', letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: '2px' }}>{mon}</div>
                </div>
                <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,.07)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'rgba(255,255,255,.82)' }}>{f.name}</span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: badge.bg, color: badge.text, flexShrink: 0 }}>{badge.label}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .fest-teaser-card { padding: 28px 20px !important; }
        }
      `}</style>
    </section>
  )
}
