'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import type { HoroscopeLang } from '@/types/horoscope'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LagnaWindow {
  lagnaName: string
  startTime: string
  endTime: string
  isFavorable: boolean
}

interface CheckItem {
  name: string
  passed: boolean
  detail: string
  weight: number
}

interface PersonCompat {
  moonOk: boolean
  taraOk: boolean
  moonDetail: string
  taraDetail: string
}

interface MuhurtaDateResult {
  date: string
  dayOfWeek: string
  score: number
  grade: 'excellent' | 'good' | 'acceptable' | 'avoid'
  tithi: { name: string; paksha: string; number: number; isAuspicious: boolean }
  nakshatra: { name: string; index: number; isAuspicious: boolean }
  vara: { name: string; isAuspicious: boolean }
  isKharMaas: boolean
  isAdhikMaas: boolean
  jupiterRetrograde: boolean
  venusRetrograde: boolean
  jupiterCombust: boolean
  venusCombust: boolean
  lagnaWindows: LagnaWindow[]
  checks: CheckItem[]
  person1Compat?: PersonCompat
  person2Compat?: PersonCompat
}

interface MuhurtaResponse {
  success: true
  data: {
    dates: MuhurtaDateResult[]
    summary: { total: number; excellent: number; good: number; acceptable: number; avoid: number }
    restrictedPeriods: Array<{ start: string; end: string; reason: string }>
  }
}

interface LocationOption {
  label: string
  sublabel?: string
  lat: number
  lng: number
  timezone: string
}

interface PersonInput {
  name: string
  moonSignNumber: number
  nakshatraIndex: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOON_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

const GRADE_COLORS: Record<string, string> = {
  excellent: '#16a34a',
  good: '#2563eb',
  acceptable: '#d97706',
  avoid: 'rgba(128,128,128,0.35)',
}

const GRADE_BG: Record<string, string> = {
  excellent: 'rgba(22,163,74,0.1)',
  good: 'rgba(37,99,235,0.1)',
  acceptable: 'rgba(217,119,6,0.1)',
  avoid: 'rgba(0,0,0,0.05)',
}

const HI = {
  title: 'विवाह मुहूर्त',
  subtitle: 'अपने विवाह के लिए शुभ तिथियां खोजें',
  dateRange: 'तिथि सीमा',
  from: 'से',
  to: 'तक',
  location: 'विवाह स्थान',
  personalCheck: 'व्यक्तिगत अनुकूलता जांचें',
  submit: 'शुभ तिथियां खोजें →',
  excellent: 'उत्तम',
  good: 'शुभ',
  acceptable: 'सामान्य',
  avoid: 'अशुभ',
  lagnaWindows: 'शुभ लग्न',
  checks: 'जांच परिणाम',
  kharMaasWarning: 'खर मास: इस अवधि में विवाह वर्जित है',
  noAuspicious: 'इस अवधि में कोई शुभ तिथि नहीं मिली। कृपया अवधि बदलें।',
  score: 'अंक',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYYYYMMDD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MuhurtaClient() {
  const searchParams = useSearchParams()
  const fromMilan = searchParams.get('from') === 'kundli-milan'

  // Form state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [location, setLocation] = useState<LocationOption | null>(null)
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([])
  const [locationLoading, setLocationLoading] = useState(true)
  const [showPersonal, setShowPersonal] = useState(false)
  const [person1, setPerson1] = useState<PersonInput>({ name: '', moonSignNumber: 1, nakshatraIndex: 0 })
  const [person2, setPerson2] = useState<PersonInput>({ name: '', moonSignNumber: 1, nakshatraIndex: 0 })
  const [customLat, setCustomLat] = useState<string>('20.5937')
  const [customLng, setCustomLng] = useState<string>('78.9629')
  const [customLocationName, setCustomLocationName] = useState<string>('')
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0)
  const [showCustomLocation, setShowCustomLocation] = useState(false)

  // Results state
  const [results, setResults] = useState<MuhurtaResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<MuhurtaDateResult | null>(null)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)

  // Lang
  const [lang, setLang] = useState<HoroscopeLang>('en')

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en

  // ── Mount: init dates, lang, milan prefill, IP location ──
  useEffect(() => {
    const today = new Date()
    setStartDate(toYYYYMMDD(today))
    setEndDate(toYYYYMMDD(addMonths(today, 6)))

    const storedLang = localStorage.getItem('horoscope_lang')
    if (storedLang === 'hi' || storedLang === 'en') setLang(storedLang)

    // Pre-fill from Milan result
    try {
      const raw = localStorage.getItem('milanResult')
      if (raw) {
        const stored = JSON.parse(raw)
        const { result, person1Input, person2Input } = stored
        if (result && result.person1 && result.person2) {
          setShowPersonal(true)
          setPerson1(prev => ({
            ...prev,
            name: result.person1.name || '',
            moonSignNumber: typeof result.person1.moonSignNumber === 'number' ? result.person1.moonSignNumber : 1,
            nakshatraIndex: typeof result.person1.nakshatraIndex === 'number' ? result.person1.nakshatraIndex : 0,
          }))
          setPerson2(prev => ({
            ...prev,
            name: result.person2.name || '',
            moonSignNumber: typeof result.person2.moonSignNumber === 'number' ? result.person2.moonSignNumber : 1,
            nakshatraIndex: typeof result.person2.nakshatraIndex === 'number' ? result.person2.nakshatraIndex : 0,
          }))

          // Build location options from Milan birth places
          const opts: LocationOption[] = []
          if (person1Input?.latitude && person1Input?.longitude) {
            opts.push({
              label: `${result.person1.name || 'Person 1'}'s birthplace`,
              sublabel: person1Input.birthPlace || 'Person 1',
              lat: person1Input.latitude,
              lng: person1Input.longitude,
              timezone: person1Input.timezone || 'Asia/Kolkata',
            })
          }
          if (person2Input?.latitude && person2Input?.longitude) {
            opts.push({
              label: `${result.person2.name || 'Person 2'}'s birthplace`,
              sublabel: person2Input.birthPlace || 'Person 2',
              lat: person2Input.latitude,
              lng: person2Input.longitude,
              timezone: person2Input.timezone || 'Asia/Kolkata',
            })
          }
          if (opts.length > 0) {
            opts.push({ label: 'Enter different location', lat: 0, lng: 0, timezone: 'Asia/Kolkata' })
            setLocationOptions(opts)
            setLocation(opts[0])
            setLocationLoading(false)
            return
          }
        }
      }
    } catch {
      // ignore parse errors
    }

    // Fetch IP location
    fetch('/api/panchang/ip-location')
      .then(r => r.json())
      .then(data => {
        const opts: LocationOption[] = []
        if (data?.latitude && data?.longitude) {
          opts.push({
            label: `Near your location${data.city ? ` — ${data.city}` : ''}`,
            lat: data.latitude,
            lng: data.longitude,
            timezone: data.timezone || 'Asia/Kolkata',
          })
        }
        opts.push({ label: 'Enter different location', lat: 0, lng: 0, timezone: 'Asia/Kolkata' })
        setLocationOptions(opts)
        if (opts.length > 0) setLocation(opts[0])
      })
      .catch(() => {
        const opts: LocationOption[] = [
          { label: 'Enter different location', lat: 0, lng: 0, timezone: 'Asia/Kolkata' },
        ]
        setLocationOptions(opts)
      })
      .finally(() => setLocationLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLocationSelect = useCallback((idx: number) => {
    setSelectedLocationIndex(idx)
    const opt = locationOptions[idx]
    if (!opt) return
    if (opt.lat === 0 && opt.lng === 0) {
      setShowCustomLocation(true)
      setLocation(null)
    } else {
      setShowCustomLocation(false)
      setLocation(opt)
    }
  }, [locationOptions])

  const handleCustomLocationConfirm = () => {
    const lat = parseFloat(customLat)
    const lng = parseFloat(customLng)
    if (isNaN(lat) || isNaN(lng)) return
    setLocation({
      label: customLocationName || 'Custom location',
      lat,
      lng,
      timezone: 'Asia/Kolkata',
    })
  }

  const validate = (): string | null => {
    if (!startDate || !endDate) return 'Please select a date range.'
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) return 'End date must be after start date.'
    const diffMs = end.getTime() - start.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    if (diffDays > 366) return 'Date range cannot exceed 1 year.'
    if (!location) return 'Please select or enter a ceremony location.'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    if (!location) return

    setError(null)
    setLoading(true)
    setResults(null)
    setSelectedDate(null)

    try {
      const body: Record<string, unknown> = {
        startDate,
        endDate,
        latitude: location.lat,
        longitude: location.lng,
        timezone: location.timezone,
      }

      if (showPersonal && person1.name) {
        body.person1 = {
          name: person1.name,
          moonSignNumber: person1.moonSignNumber,
          nakshatraIndex: person1.nakshatraIndex,
        }
      }
      if (showPersonal && person2.name) {
        body.person2 = {
          name: person2.name,
          moonSignNumber: person2.moonSignNumber,
          nakshatraIndex: person2.nakshatraIndex,
        }
      }

      const res = await fetch('/api/muhurta/marriage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message ?? `Request failed (${res.status})`)
      }
      setResults(json)
      setCurrentMonthOffset(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setSelectedDate(null)
    setError(null)
    setCurrentMonthOffset(0)
  }

  // ── Compute months list for calendar navigation ──
  const months = (() => {
    if (!results) return []
    const seen = new Set<string>()
    const list: string[] = []
    for (const d of results.data.dates) {
      const key = getMonthKey(d.date)
      if (!seen.has(key)) { seen.add(key); list.push(key) }
    }
    return list
  })()

  const currentMonthKey = months[currentMonthOffset] ?? ''
  const [currentYear, currentMonth] = currentMonthKey
    ? [parseInt(currentMonthKey.slice(0, 4)), parseInt(currentMonthKey.slice(5, 7)) - 1]
    : [new Date().getFullYear(), new Date().getMonth()]

  // Map date → result for quick lookup
  const dateMap = new Map<string, MuhurtaDateResult>()
  if (results) {
    for (const d of results.data.dates) dateMap.set(d.date, d)
  }

  // ── Calendar helpers ──
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarCells: Array<{ date: string | null; result: MuhurtaDateResult | null }> = []
  for (let i = 0; i < firstDay; i++) calendarCells.push({ date: null, result: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarCells.push({ date: dateStr, result: dateMap.get(dateStr) ?? null })
  }

  const monthLabel = new Date(currentYear, currentMonth, 1)
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  // ── Khar Maas restricted periods (for banner) ──
  const kharMaasPeriods = results?.data.restrictedPeriods.filter(p =>
    p.reason.toLowerCase().includes('khar') || p.reason.toLowerCase().includes('khar maas')
  ) ?? []

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    const startD = new Date(startDate)
    const endD = new Date(endDate)
    const diffDays = Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, border: '3px solid var(--border)',
          borderTopColor: 'var(--blue)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 24px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 16, color: 'var(--text2)' }}>
          Analyzing {diffDays} dates...
        </p>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
          Checking tithi, nakshatra, vara, lagna windows and planetary conditions
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Results
  // ─────────────────────────────────────────────────────────────────────────────
  if (results) {
    const { summary } = results.data
    const favorableLagnas = selectedDate?.lagnaWindows.filter(l => l.isFavorable) ?? []

    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Breadcrumb */}
        {fromMilan && (
          <div style={{ padding: '0 8px 16px', fontSize: 13, color: 'var(--text3)' }}>
            <a href="/kundli-milan" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Kundli Milan</a>
            <span style={{ margin: '0 6px' }}>→</span>
            <span>Marriage Muhurta</span>
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 20px', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {t('Auspicious Wedding Dates', 'शुभ विवाह तिथियां')}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
              {location?.label} · {startDate} to {endDate}
            </p>
          </div>
          <LanguageToggle value={lang} onChange={l => { setLang(l); localStorage.setItem('horoscope_lang', l) }} />
        </div>

        {/* Summary bar */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          padding: '14px 16px', borderRadius: 12,
          border: '1px solid var(--border)', background: 'hsl(var(--card))',
          marginBottom: 16, boxShadow: 'var(--shadow-md)',
        }}>
          {(['excellent', 'good', 'acceptable', 'avoid'] as const).map(g => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: GRADE_COLORS[g], display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                {t(g.charAt(0).toUpperCase() + g.slice(1), HI[g as keyof typeof HI] as string)}:&nbsp;
                <strong style={{ color: 'var(--text)' }}>{summary[g]}</strong>
              </span>
            </div>
          ))}
          <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>
            {t('Total analyzed', 'कुल विश्लेषित')}: {summary.total}
          </span>
        </div>

        {/* Khar Maas warning */}
        {kharMaasPeriods.length > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
            marginBottom: 16, fontSize: 13, color: '#92400e',
          }}>
            {kharMaasPeriods.map((p, i) => (
              <div key={i}>
                ⚠ {lang === 'hi' ? HI.kharMaasWarning : p.reason}: {p.start} – {p.end}
              </div>
            ))}
          </div>
        )}

        {/* Other restricted periods */}
        {results.data.restrictedPeriods.filter(p =>
          !p.reason.toLowerCase().includes('khar')
        ).map((p, i) => (
          <div key={i} style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
            marginBottom: 10, fontSize: 13, color: '#991b1b',
          }}>
            ⚠ {p.reason}: {p.start} – {p.end}
          </div>
        ))}

        {/* Calendar + Detail panel */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Calendar */}
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            {/* Month nav */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '12px 12px 0 0',
              border: '1px solid var(--border)', borderBottom: 'none',
              background: 'hsl(var(--card))',
            }}>
              <button
                onClick={() => setCurrentMonthOffset(o => Math.max(0, o - 1))}
                disabled={currentMonthOffset === 0}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'hsl(var(--background))', cursor: currentMonthOffset === 0 ? 'default' : 'pointer',
                  opacity: currentMonthOffset === 0 ? 0.4 : 1, fontSize: 14, color: 'var(--text)',
                }}
              >
                ←
              </button>
              <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{monthLabel}</span>
              <button
                onClick={() => setCurrentMonthOffset(o => Math.min(months.length - 1, o + 1))}
                disabled={currentMonthOffset >= months.length - 1}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'hsl(var(--background))', cursor: currentMonthOffset >= months.length - 1 ? 'default' : 'pointer',
                  opacity: currentMonthOffset >= months.length - 1 ? 0.4 : 1, fontSize: 14, color: 'var(--text)',
                }}
              >
                →
              </button>
            </div>

            {/* Day headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              border: '1px solid var(--border)', borderBottom: 'none',
              background: 'hsl(var(--muted)/0.4)',
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{
                  textAlign: 'center', padding: '8px 4px', fontSize: 11,
                  fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.04em',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              border: '1px solid var(--border)', borderTop: 'none',
              borderRadius: '0 0 12px 12px', overflow: 'hidden',
              background: 'hsl(var(--card))',
            }}>
              {calendarCells.map((cell, idx) => {
                if (!cell.date) {
                  return <div key={`empty-${idx}`} style={{ minHeight: 52, background: 'hsl(var(--muted)/0.2)' }} />
                }
                const r = cell.result
                const dayNum = parseInt(cell.date.slice(8, 10))
                const isSelected = selectedDate?.date === cell.date
                const isInRange = r !== null
                const isKharMaas = r?.isKharMaas

                return (
                  <div
                    key={cell.date}
                    onClick={() => r && !isKharMaas && setSelectedDate(isSelected ? null : r)}
                    style={{
                      minHeight: 52, padding: '8px 6px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      cursor: isInRange && !isKharMaas ? 'pointer' : 'default',
                      background: isSelected
                        ? 'rgba(37,99,235,0.08)'
                        : isKharMaas ? 'rgba(0,0,0,0.04)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                      outline: isSelected ? '2px solid var(--blue)' : 'none',
                      outlineOffset: -2,
                      transition: 'background 0.15s',
                      opacity: isKharMaas ? 0.45 : 1,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isInRange ? 'var(--text)' : 'var(--text3)' }}>
                      {dayNum}
                    </span>
                    {r && !isKharMaas && (
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', marginTop: 4,
                        background: GRADE_COLORS[r.grade], display: 'block', flexShrink: 0,
                      }} />
                    )}
                    {isKharMaas && (
                      <span style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>KM</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, padding: '12px 4px', flexWrap: 'wrap' }}>
              {(['excellent', 'good', 'acceptable', 'avoid'] as const).map(g => (
                <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: GRADE_COLORS[g], display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {t(g.charAt(0).toUpperCase() + g.slice(1), HI[g as keyof typeof HI] as string)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', opacity: 0.45 }}>KM</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Khar Maas</span>
              </div>
            </div>

            {/* No auspicious dates notice */}
            {results.data.dates.filter(d => getMonthKey(d.date) === currentMonthKey).length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
                {lang === 'hi' ? HI.noAuspicious : 'No auspicious dates this month. Try navigating to another month.'}
              </p>
            )}
          </div>

          {/* Detail panel */}
          {selectedDate && (
            <div style={{
              flex: '1 1 280px', minWidth: 0,
              border: '1px solid var(--border)', borderRadius: 12,
              background: 'hsl(var(--card))', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
            }}>
              {/* Date header */}
              <div style={{
                padding: '16px 18px', borderBottom: '1px solid var(--border)',
                background: GRADE_BG[selectedDate.grade],
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: GRADE_COLORS[selectedDate.grade],
                      background: GRADE_BG[selectedDate.grade],
                      border: `1px solid ${GRADE_COLORS[selectedDate.grade]}`,
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      {t(
                        selectedDate.grade.charAt(0).toUpperCase() + selectedDate.grade.slice(1),
                        HI[selectedDate.grade as keyof typeof HI] as string
                      )}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                    {formatDisplayDate(selectedDate.date)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                    {t('Score', HI.score)}: <strong style={{ color: 'var(--text)' }}>{selectedDate.score}</strong> / 100
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', fontSize: 18, lineHeight: 1, padding: '2px 4px', flexShrink: 0,
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Panchang row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { label: 'Tithi', value: `${selectedDate.tithi.name} (${selectedDate.tithi.paksha})`, ok: selectedDate.tithi.isAuspicious },
                    { label: 'Nakshatra', value: selectedDate.nakshatra.name, ok: selectedDate.nakshatra.isAuspicious },
                    { label: 'Vara', value: selectedDate.vara.name, ok: selectedDate.vara.isAuspicious },
                  ].map(item => (
                    <div key={item.label} style={{
                      flex: '1 1 90px', padding: '8px 10px', borderRadius: 8,
                      border: `1px solid ${item.ok ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.25)'}`,
                      background: item.ok ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.05em', marginBottom: 2 }}>
                        {item.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Planetary flags */}
                {(selectedDate.jupiterRetrograde || selectedDate.venusRetrograde ||
                  selectedDate.jupiterCombust || selectedDate.venusCombust ||
                  selectedDate.isAdhikMaas) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedDate.jupiterRetrograde && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(220,38,38,0.08)', color: '#991b1b', border: '1px solid rgba(220,38,38,0.2)' }}>
                        Jupiter Retrograde
                      </span>
                    )}
                    {selectedDate.venusRetrograde && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(220,38,38,0.08)', color: '#991b1b', border: '1px solid rgba(220,38,38,0.2)' }}>
                        Venus Retrograde
                      </span>
                    )}
                    {selectedDate.jupiterCombust && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.08)', color: '#92400e', border: '1px solid rgba(217,119,6,0.25)' }}>
                        Jupiter Combust
                      </span>
                    )}
                    {selectedDate.venusCombust && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.08)', color: '#92400e', border: '1px solid rgba(217,119,6,0.25)' }}>
                        Venus Combust
                      </span>
                    )}
                    {selectedDate.isAdhikMaas && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(220,38,38,0.08)', color: '#991b1b', border: '1px solid rgba(220,38,38,0.2)' }}>
                        Adhik Maas
                      </span>
                    )}
                  </div>
                )}

                {/* Lagna windows */}
                {favorableLagnas.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, letterSpacing: '0.04em' }}>
                      {t('AUSPICIOUS LAGNA WINDOWS', 'शुभ लग्न समय')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {favorableLagnas.map((l, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 10px', borderRadius: 8,
                          background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)',
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{l.lagnaName}</span>
                          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{l.startTime} – {l.endTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checks list */}
                {selectedDate.checks.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, letterSpacing: '0.04em' }}>
                      {t('MUHURTA CHECKS', 'मुहूर्त जांच')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {selectedDate.checks.map((c, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '7px 10px', borderRadius: 8,
                          background: c.passed ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.04)',
                          border: `1px solid ${c.passed ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}`,
                        }}>
                          <span style={{ fontSize: 14, flexShrink: 0, color: c.passed ? '#16a34a' : '#dc2626', marginTop: 1 }}>
                            {c.passed ? '✓' : '✗'}
                          </span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                            {c.detail && (
                              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{c.detail}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal compatibility */}
                {(selectedDate.person1Compat || selectedDate.person2Compat) && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, letterSpacing: '0.04em' }}>
                      {t('PERSONAL COMPATIBILITY', 'व्यक्तिगत अनुकूलता')}
                    </div>
                    {[
                      { label: person1.name || 'Person 1', compat: selectedDate.person1Compat },
                      { label: person2.name || 'Person 2', compat: selectedDate.person2Compat },
                    ].filter(x => x.compat).map(({ label, compat }) => (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {[
                            { key: 'Moon', ok: compat!.moonOk, detail: compat!.moonDetail },
                            { key: 'Tara', ok: compat!.taraOk, detail: compat!.taraDetail },
                          ].map(item => (
                            <div key={item.key} style={{
                              display: 'flex', alignItems: 'flex-start', gap: 7,
                              padding: '5px 8px', borderRadius: 7,
                              background: item.ok ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.04)',
                            }}>
                              <span style={{ fontSize: 12, color: item.ok ? '#16a34a' : '#dc2626', flexShrink: 0, marginTop: 1 }}>
                                {item.ok ? '✓' : '✗'}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                                <strong>{item.key}: </strong>{item.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Search again */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'hsl(var(--background))', color: 'var(--text)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            ← {t('Search again', 'फिर से खोजें')}
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Form
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 80px' }}>

      {/* Breadcrumb */}
      {fromMilan && (
        <div style={{ padding: '16px 8px 0', fontSize: 13, color: 'var(--text3)' }}>
          <a href="/kundli-milan" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Kundli Milan</a>
          <span style={{ margin: '0 6px' }}>→</span>
          <span>Marriage Muhurta</span>
        </div>
      )}

      {/* Page header */}
      <div style={{ padding: '32px 8px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 8 }}>
            Vedic Astrology
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 700, lineHeight: 1.2, color: 'var(--text)', margin: '0 0 6px' }}>
            {lang === 'hi' ? HI.title : 'Marriage Muhurta'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>
            {lang === 'hi' ? HI.subtitle : 'Find the most auspicious dates for your wedding'}
          </p>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 28 }}>
          <LanguageToggle value={lang} onChange={l => { setLang(l); localStorage.setItem('horoscope_lang', l) }} />
        </div>
      </div>

      {/* Form card */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 16,
        background: 'hsl(var(--card))', boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
      }}>

        {/* Section 1 — Date Range */}
        <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
            {lang === 'hi' ? HI.dateRange : 'Date Range'}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                {lang === 'hi' ? HI.from : 'From'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={toYYYYMMDD(new Date())}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14,
                  border: '1px solid var(--border)', background: 'hsl(var(--background))',
                  color: 'var(--text)', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                {lang === 'hi' ? HI.to : 'To'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || toYYYYMMDD(new Date())}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14,
                  border: '1px solid var(--border)', background: 'hsl(var(--background))',
                  color: 'var(--text)', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Maximum range: 1 year
          </p>
        </div>

        {/* Section 2 — Location */}
        <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>
            {lang === 'hi' ? HI.location : 'Ceremony Location'}
          </div>

          {locationLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Detecting your location...</p>
          ) : (
            <>
              <select
                value={selectedLocationIndex}
                onChange={e => handleLocationSelect(parseInt(e.target.value))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14,
                  border: '1px solid var(--border)', background: 'hsl(var(--background))',
                  color: 'var(--text)', cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                {locationOptions.map((opt, i) => (
                  <option key={i} value={i}>
                    {opt.label}{opt.sublabel ? ` (${opt.sublabel})` : ''}
                  </option>
                ))}
              </select>

              {showCustomLocation && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Location name (e.g. Mumbai)"
                    value={customLocationName}
                    onChange={e => setCustomLocationName(e.target.value)}
                    style={{
                      padding: '9px 12px', borderRadius: 9, fontSize: 14,
                      border: '1px solid var(--border)', background: 'hsl(var(--background))',
                      color: 'var(--text)', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Latitude</label>
                      <input
                        type="number"
                        value={customLat}
                        onChange={e => setCustomLat(e.target.value)}
                        placeholder="e.g. 19.0760"
                        step="0.0001"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14,
                          border: '1px solid var(--border)', background: 'hsl(var(--background))',
                          color: 'var(--text)', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Longitude</label>
                      <input
                        type="number"
                        value={customLng}
                        onChange={e => setCustomLng(e.target.value)}
                        placeholder="e.g. 72.8777"
                        step="0.0001"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14,
                          border: '1px solid var(--border)', background: 'hsl(var(--background))',
                          color: 'var(--text)', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCustomLocationConfirm}
                    style={{
                      padding: '9px 20px', borderRadius: 9, border: '1px solid var(--blue)',
                      background: 'rgba(37,99,235,0.06)', color: 'var(--blue)',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
                    }}
                  >
                    Set location
                  </button>
                  {location && showCustomLocation && (
                    <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>
                      ✓ Location set: {location.label} ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 3 — Personal Compatibility */}
        <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPersonal}
              onChange={e => setShowPersonal(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue)' }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
              {lang === 'hi' ? HI.personalCheck : 'Include personal compatibility check'} (optional)
            </span>
          </label>

          {showPersonal && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Person 1', person: person1, setPerson: setPerson1 },
                { label: 'Person 2', person: person2, setPerson: setPerson2 },
              ].map(({ label, person, setPerson }) => (
                <div key={label} style={{
                  padding: '14px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'hsl(var(--background))',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 12, letterSpacing: '0.05em' }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Name</label>
                      <input
                        type="text"
                        value={person.name}
                        onChange={e => setPerson(p => ({ ...p, name: e.target.value }))}
                        placeholder={`${label} name`}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
                          border: '1px solid var(--border)', background: 'hsl(var(--card))',
                          color: 'var(--text)', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Moon Sign (Rashi)</label>
                        <select
                          value={person.moonSignNumber}
                          onChange={e => setPerson(p => ({ ...p, moonSignNumber: parseInt(e.target.value) }))}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 13,
                            border: '1px solid var(--border)', background: 'hsl(var(--card))',
                            color: 'var(--text)', cursor: 'pointer', boxSizing: 'border-box',
                          }}
                        >
                          {MOON_SIGNS.map((name, i) => (
                            <option key={i} value={i + 1}>{name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Nakshatra</label>
                        <select
                          value={person.nakshatraIndex}
                          onChange={e => setPerson(p => ({ ...p, nakshatraIndex: parseInt(e.target.value) }))}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 13,
                            border: '1px solid var(--border)', background: 'hsl(var(--card))',
                            color: 'var(--text)', cursor: 'pointer', boxSizing: 'border-box',
                          }}
                        >
                          {NAKSHATRAS.map((name, i) => (
                            <option key={i} value={i}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 20px', fontSize: 13, color: '#991b1b',
            background: 'rgba(220,38,38,0.06)', borderBottom: '1px solid rgba(220,38,38,0.15)',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ padding: '20px 20px' }}>
          <button
            onClick={handleSubmit}
            disabled={!location}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 10,
              background: !location ? 'rgba(37,99,235,0.4)' : 'var(--blue)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              border: 'none', cursor: !location ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em', transition: 'opacity 0.15s',
            }}
          >
            {lang === 'hi' ? HI.submit : 'Find Auspicious Dates →'}
          </button>
          {!location && !locationLoading && (
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, textAlign: 'center' }}>
              Please select or enter a ceremony location above
            </p>
          )}
        </div>
      </div>

      {/* Info note */}
      <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        Analysis checks tithi, nakshatra, vara, lagna windows, Jupiter &amp; Venus conditions,
        Khar Maas periods, and personal Moon/Tara compatibility.
      </p>
    </div>
  )
}
