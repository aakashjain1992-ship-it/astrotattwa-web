'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { RASHI_MAP } from '@/lib/horoscope/rashiMap'
import type { HoroscopeContent, HoroscopeType } from '@/types/horoscope'

interface RashiInfo { slug: string; name: string; symbol: string }

const DEFAULT_RASHI: RashiInfo = { slug: 'aries', name: 'Aries', symbol: '♈' }

const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TYPES: { key: HoroscopeType; label: string }[] = [
  { key: 'daily',   label: 'Daily'   },
  { key: 'weekly',  label: 'Weekly'  },
  { key: 'monthly', label: 'Monthly' },
]

function getISTDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
}

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function getDateLabel(type: HoroscopeType): string {
  const d = getISTDate()

  if (type === 'daily') {
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  if (type === 'weekly') {
    const day = d.getDay() // 0 = Sunday
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const sm = monday.getMonth(), em = sunday.getMonth()
    const sy = monday.getFullYear(), ey = sunday.getFullYear()
    if (sm === em && sy === ey) {
      return `${monday.getDate()}–${sunday.getDate()} ${SHORT_MONTHS[sm]} ${sy}`
    }
    if (sy === ey) {
      return `${monday.getDate()} ${SHORT_MONTHS[sm]} – ${sunday.getDate()} ${SHORT_MONTHS[em]} ${sy}`
    }
    return `${monday.getDate()} ${SHORT_MONTHS[sm]} ${sy} – ${sunday.getDate()} ${SHORT_MONTHS[em]} ${ey}`
  }

  // monthly
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Fetch the user's favorite saved chart moon_sign from the API. */
async function getRashiFromSavedChart(): Promise<RashiInfo | null> {
  try {
    const res = await fetch('/api/save-chart')
    if (!res.ok) return null
    const json = await res.json()
    const charts: Array<{ is_favorite: boolean | null; moon_sign: number | null }> = json.charts ?? []
    const fav = charts.find(c => c.is_favorite)
    if (!fav?.moon_sign) return null
    const info = RASHI_MAP.find(r => r.signNumber === fav.moon_sign)
    if (!info) return null
    return { slug: info.slug, name: info.nameEn, symbol: info.symbol }
  } catch {
    return null
  }
}

function colourToHex(text: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e',
    blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7',
    pink: '#ec4899', white: '#e2e8f0', black: '#1e293b', grey: '#94a3b8',
    gray: '#94a3b8', gold: '#D4A017', silver: '#cbd5e1', brown: '#92400e',
    cyan: '#06b6d4', teal: '#14b8a6', maroon: '#9f1239', saffron: '#f97316',
  }
  const lower = text.toLowerCase()
  for (const [key, hex] of Object.entries(map)) {
    if (lower.includes(key)) return hex
  }
  return '#94a3b8'
}

function truncate(text: string, max: number): string {
  if (!text || text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

const SECTIONS = [
  { key: 'career', icon: '💼', label: 'Career' },
  { key: 'love',   icon: '💞', label: 'Love'   },
  { key: 'health', icon: '🌿', label: 'Health' },
] as const

export function HoroscopeTeaser() {
  const { user, loading: authLoading } = useAuth()

  const [rashi,     setRashi]     = useState<RashiInfo>(DEFAULT_RASHI)
  const [type,      setType]      = useState<HoroscopeType>('daily')
  const [dateLabel, setDateLabel] = useState<string>('')
  const [content,   setContent]   = useState<HoroscopeContent | null>(null)
  const [loading,   setLoading]   = useState(true)

  const fetchHoroscope = useCallback((t: HoroscopeType, rashiSlug: string) => {
    setLoading(true)
    setContent(null)
    const date = todayIST()
    fetch(`/api/horoscope?type=${t}&rashi=${rashiSlug}&sign_type=moon&date=${date}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const row = json.data ?? json
        if (row?.content_en?.overview) setContent(row.content_en)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Wait for auth to resolve, then determine rashi + kick off first fetch
  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    async function run() {
      let resolvedRashi = DEFAULT_RASHI

      // If logged in, fetch moon sign from the favorite saved chart
      if (user) {
        const fromDb = await getRashiFromSavedChart()
        if (fromDb) resolvedRashi = fromDb
      }

      if (!cancelled) {
        setRashi(resolvedRashi)
        setDateLabel(getDateLabel('daily'))
        fetchHoroscope('daily', resolvedRashi.slug)
      }
    }

    run()
    return () => { cancelled = true }
  }, [authLoading, user, fetchHoroscope])

  const handleTypeChange = (t: HoroscopeType) => {
    if (t === type) return
    setType(t)
    setDateLabel(getDateLabel(t))
    fetchHoroscope(t, rashi.slug)
  }

  const overviewMax = type === 'daily' ? 220 : 300

  if (!authLoading && !loading && !content) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Eyebrow */}
      <span style={{ fontSize: '10.5px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '6px', display: 'block' }}>
        ✦ Horoscope
      </span>

      {/* Title row + type toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(18px,1.6vw,25px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, margin: 0 }}>
          {rashi.symbol} {rashi.name}
        </h2>

        {/* Daily / Weekly / Monthly tabs */}
        <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', flexShrink: 0 }}>
          {TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTypeChange(key)}
              style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '.4px',
                padding: '5px 10px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', transition: 'background .15s, color .15s',
                background: type === key ? 'var(--blue)' : 'transparent',
                color: type === key ? '#0A0A14' : 'var(--text3)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date label */}
      {dateLabel && (
        <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '0 0 14px', letterSpacing: '.2px' }}>
          {dateLabel}
        </p>
      )}

      {loading ? <HoroscopeSkeleton /> : content ? (
        <>
          {/* Overview */}
          <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '8px' }}>
            <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--text2)', margin: 0 }}>
              {truncate(content.overview, overviewMax)}
            </p>
          </div>

          {/* Career / Love / Health */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
            {SECTIONS.map(({ key, icon, label }, i) => (
              <div key={key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', background: i % 2 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: i < SECTIONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.55 }}>
                    {truncate(content[key as keyof HoroscopeContent] as string, 100)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2×2 insight chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            {[
              { icon: '🎨', label: 'Lucky Colour',    value: content.lucky_colour,    swatch: colourToHex(content.lucky_colour) },
              { icon: '🔢', label: 'Lucky Number',    value: content.lucky_number,    swatch: null },
              { icon: '⏰', label: 'Favourable Time', value: content.favourable_time, swatch: null },
              { icon: '🌿', label: 'Remedy',          value: truncate(content.remedy, 55), swatch: null },
            ].map(chip => (
              <div key={chip.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,160,23,.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px' }}>{chip.icon}</span>
                  {chip.swatch && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chip.swatch, display: 'inline-block', flexShrink: 0 }} />}
                  <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)' }}>{chip.label}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text2)', fontWeight: 500, lineHeight: 1.4 }}>{chip.value}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <Link href={`/horoscope/${type}/${rashi.slug}`} style={{ display: 'block', textAlign: 'center', background: 'var(--blue)', color: '#0A0A14', fontWeight: 600, fontSize: '14px', letterSpacing: '.3px', padding: '13px 0', borderRadius: '10px', textDecoration: 'none', transition: 'opacity .18s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Check your horoscope →
        </Link>
      </div>
    </div>
  )
}

function HoroscopeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
        {[100, 85, 65].map((w, i) => (
          <div key={i} style={{ height: '13px', width: `${w}%`, background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginBottom: i < 2 ? '7px' : 0 }} />
        ))}
      </div>
      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
            <div style={{ height: '9px', width: '50px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '6px' }} />
            <div style={{ height: '12px', width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px' }}>
            <div style={{ height: '9px', width: '55%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '6px' }} />
            <div style={{ height: '12px', width: '70%', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
