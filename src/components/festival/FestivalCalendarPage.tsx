'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FestivalData } from '@/lib/panchang/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD = '#D4A017'
const GOLD_RGBA = (a: number) => `rgba(212,160,23,${a})`

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const TYPE_INFO: Record<string, { label: string; color: string; bg: string }> = {
  major:      { label: 'Festival',  color: GOLD,       bg: GOLD_RGBA(.14) },
  fast:       { label: 'Ekadashi',  color: '#A78BFA',  bg: 'rgba(167,139,250,.12)' },
  auspicious: { label: 'Holiday',   color: '#34D399',  bg: 'rgba(52,211,153,.12)' },
  minor:      { label: 'Minor',     color: '#60A5FA',  bg: 'rgba(96,165,250,.12)' },
  purnima:    { label: 'Full Moon', color: '#93C5FD',  bg: 'rgba(147,197,253,.10)' },
  amavasya:   { label: 'New Moon',  color: '#94A3B8',  bg: 'rgba(148,163,184,.10)' },
}

const FILTER_OPTIONS = [
  { key: 'all',       label: 'All' },
  { key: 'major',     label: 'Festivals' },
  { key: 'fast',      label: 'Ekadashis' },
  { key: 'auspicious',label: 'Holidays' },
  { key: 'minor',     label: 'Minor' },
  { key: 'purnima',   label: 'Full Moon' },
  { key: 'amavasya',  label: 'New Moon' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateStr(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { year: y, month: m, day: d }
}

function getDow(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  return DAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

// ── Festival Row ──────────────────────────────────────────────────────────────

function FestRow({ f }: { f: FestivalData }) {
  const info = TYPE_INFO[f.type] ?? TYPE_INFO.minor
  const { month, day } = parseDateStr(f.date)
  const dow = getDow(f.date)
  const mon = MONTH_NAMES[month - 1].slice(0, 3).toUpperCase()

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.04)',
    }}>
      {/* Date block */}
      <div style={{ flexShrink: 0, width: '42px', textAlign: 'center' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: GOLD, opacity: .65, marginBottom: '2px' }}>{dow}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1, color: 'rgba(255,255,255,.88)' }}>{day}</div>
        <div style={{ fontSize: '9px', letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: '2px' }}>{mon}</div>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,.07)', flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,.85)' }}>{f.name}</span>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '99px',
            background: info.bg, color: info.color, flexShrink: 0,
          }}>{info.label}</span>
        </div>
        {f.description && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', margin: '4px 0 0', lineHeight: 1.55 }}>
            {f.description}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FestivalCalendarPage() {
  const now = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDay   = now.getDate()

  const [activeYear,    setActiveYear]    = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedDay,   setSelectedDay]   = useState<number | null>(null)
  const [filterType,    setFilterType]    = useState('all')
  const [allFests,      setAllFests]      = useState<FestivalData[]>([])
  const [loading,       setLoading]       = useState(true)

  // Fetch full year on mount or year change
  useEffect(() => {
    setLoading(true)
    fetch(`/api/festivals?year=${activeYear}`)
      .then(r => r.json())
      .then(data => { setAllFests(data.data?.festivals ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeYear])

  // Reset day when month changes
  useEffect(() => { setSelectedDay(null) }, [selectedMonth])

  // Reset month when year changes
  useEffect(() => {
    setSelectedMonth(activeYear === currentYear ? currentMonth : 1)
  }, [activeYear, currentYear, currentMonth])

  // Group all festivals by month
  const grouped = useMemo(() => {
    const result: Record<number, FestivalData[]> = {}
    for (const f of allFests) {
      const { month } = parseDateStr(f.date)
      if (!result[month]) result[month] = []
      result[month].push(f)
    }
    return result
  }, [allFests])

  // Month's festivals with type filter applied
  const monthFests = useMemo(() => {
    const fests = grouped[selectedMonth] ?? []
    return filterType === 'all' ? fests : fests.filter(f => f.type === filterType)
  }, [grouped, selectedMonth, filterType])

  // Further filter by selected day
  const activeFests = useMemo(() => {
    if (!selectedDay) return monthFests
    return monthFests.filter(f => parseDateStr(f.date).day === selectedDay)
  }, [monthFests, selectedDay])

  // All festival days in month for grid dots (unfiltered — for navigation context)
  const festDays = useMemo(() => {
    const fests = grouped[selectedMonth] ?? []
    const days: Record<number, string[]> = {}
    for (const f of fests) {
      const { day } = parseDateStr(f.date)
      if (!days[day]) days[day] = []
      days[day].push(f.type)
    }
    return days
  }, [grouped, selectedMonth])

  // Build calendar grid cells
  const firstDow    = new Date(Date.UTC(activeYear, selectedMonth - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(activeYear, selectedMonth, 0)).getUTCDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday  = (d: number) => activeYear === currentYear && selectedMonth === currentMonth && d === currentDay
  const prevMonth = () => { if (selectedMonth > 1)  setSelectedMonth(m => m - 1) }
  const nextMonth = () => { if (selectedMonth < 12) setSelectedMonth(m => m + 1) }

  return (
    <section style={{ padding: '40px 0 80px', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 20% 30%, ${GOLD_RGBA(.04)} 0%, transparent 55%),
                     radial-gradient(ellipse at 80% 70%, rgba(120,60,200,.04) 0%, transparent 55%)`,
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ─────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase',
            color: GOLD, fontWeight: 500, marginBottom: '10px',
          }}>Hindu Calendar</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400,
              color: 'rgba(255,255,255,.92)', margin: 0, letterSpacing: '-.5px',
            }}>
              Festival Calendar {activeYear}
            </h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[currentYear, currentYear + 1].map(y => (
                <button key={y} onClick={() => setActiveYear(y)} style={{
                  padding: '7px 20px', borderRadius: '10px', fontSize: '13px',
                  cursor: 'pointer', border: '1px solid',
                  background: activeYear === y ? GOLD_RGBA(.15) : 'transparent',
                  borderColor: activeYear === y ? GOLD_RGBA(.5) : 'rgba(255,255,255,.12)',
                  color: activeYear === y ? GOLD : 'rgba(255,255,255,.4)',
                  fontWeight: activeYear === y ? 600 : 400,
                  transition: 'all .15s',
                }}>{y}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Type Filter Chips ────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {FILTER_OPTIONS.map(opt => {
            const active = filterType === opt.key
            const info   = opt.key !== 'all' ? TYPE_INFO[opt.key] : null
            return (
              <button key={opt.key} onClick={() => setFilterType(opt.key)} style={{
                padding: '6px 16px', borderRadius: '99px', fontSize: '12.5px',
                cursor: 'pointer', border: '1px solid',
                background: active ? (info ? info.bg : GOLD_RGBA(.12)) : 'transparent',
                borderColor: active ? (info ? info.color : GOLD) : 'rgba(255,255,255,.1)',
                color: active ? (info ? info.color : GOLD) : 'rgba(255,255,255,.4)',
                fontWeight: active ? 600 : 400, transition: 'all .15s',
              }}>{opt.label}</button>
            )
          })}
        </div>

        {loading ? (
          <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '14px' }}>Loading…</p>
          </div>
        ) : (
          /* ── Main Grid ─────────────────────────────── */
          <div className="festival-main-grid" style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '24px',
            alignItems: 'start',
          }}>

            {/* ── LEFT: Mini Calendar ─────────────────── */}
            <div style={{
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: '20px',
              padding: '24px',
              background: 'rgba(255,255,255,.02)',
              position: 'sticky',
              top: '84px',
            }}>

              {/* Month nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={prevMonth} disabled={selectedMonth === 1} style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px',
                  width: '32px', height: '32px', fontSize: '18px', lineHeight: 1,
                  cursor: selectedMonth === 1 ? 'default' : 'pointer',
                  color: selectedMonth === 1 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                }}>‹</button>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,.88)' }}>
                    {MONTH_NAMES[selectedMonth - 1]}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.28)', marginTop: '1px' }}>{activeYear}</div>
                </div>

                <button onClick={nextMonth} disabled={selectedMonth === 12} style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px',
                  width: '32px', height: '32px', fontSize: '18px', lineHeight: 1,
                  cursor: selectedMonth === 12 ? 'default' : 'pointer',
                  color: selectedMonth === 12 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                }}>›</button>
              </div>

              {/* Day-of-week headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
                {DAY_LABELS.map(d => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: '9.5px', fontWeight: 700,
                    color: 'rgba(255,255,255,.18)', letterSpacing: '.5px', padding: '4px 0',
                  }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />
                  const types    = festDays[day] ?? []
                  const hasFest  = types.length > 0
                  const today    = isToday(day)
                  const selected = selectedDay === day
                  const dotColors = [...new Set(types)].slice(0, 3)
                    .map(t => TYPE_INFO[t]?.color ?? GOLD)

                  return (
                    <button
                      key={`d-${day}`}
                      onClick={() => hasFest && setSelectedDay(selected ? null : day)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '6px 2px 5px', borderRadius: '8px',
                        border: today ? `1px solid ${GOLD_RGBA(.45)}` : '1px solid transparent',
                        background: selected ? GOLD_RGBA(.18) : today ? GOLD_RGBA(.08) : 'transparent',
                        cursor: hasFest ? 'pointer' : 'default',
                        transition: 'all .12s',
                      }}
                      onMouseEnter={e => { if (hasFest && !selected) e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = selected ? GOLD_RGBA(.18) : today ? GOLD_RGBA(.08) : 'transparent' }}
                    >
                      <span style={{
                        fontSize: '12px', lineHeight: 1,
                        fontWeight: today || selected ? 700 : 400,
                        color: selected ? GOLD : today ? GOLD : hasFest ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.28)',
                      }}>{day}</span>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '3px', height: '5px', alignItems: 'center' }}>
                        {dotColors.map((color, di) => (
                          <div key={di} style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }} />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.18)', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Legend</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                  {Object.entries(TYPE_INFO).map(([key, info]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)' }}>{info.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Festival List ─────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', minHeight: '32px' }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 400,
                  color: 'rgba(255,255,255,.85)', margin: 0,
                }}>
                  {selectedDay
                    ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedDay}`
                    : MONTH_NAMES[selectedMonth - 1]}
                  {' '}
                  <span style={{ color: 'rgba(255,255,255,.3)', fontStyle: 'italic' }}>{activeYear}</span>
                </h2>
                {selectedDay && (
                  <button onClick={() => setSelectedDay(null)} style={{
                    fontSize: '12px', color: 'rgba(255,255,255,.35)',
                    background: 'transparent', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: '6px', padding: '4px 12px', cursor: 'pointer',
                  }}>Show all</button>
                )}
              </div>

              {activeFests.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '14px' }}>
                    No festivals{selectedDay
                      ? ` on ${MONTH_NAMES[selectedMonth - 1]} ${selectedDay}`
                      : ` in ${MONTH_NAMES[selectedMonth - 1]}`}.
                  </p>
                </div>
              ) : (
                activeFests.map(f => <FestRow key={f.id} f={f} />)
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .festival-main-grid {
            grid-template-columns: 1fr !important;
          }
          .festival-main-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  )
}
