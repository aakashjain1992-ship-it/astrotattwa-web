'use client'
import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { CitySearch, City } from '@/components/forms/CitySearch'
import { DateNavigator } from '@/components/panchang/DateNavigator'
import { PanchangHeader } from '@/components/panchang/PanchangHeader'
import { SunriseMoonriseSection } from '@/components/panchang/sections/SunriseMoonrise'
import { PanchaBhujaSection } from '@/components/panchang/sections/PanchaBhuja'
import { LunarCalendarSection } from '@/components/panchang/sections/LunarCalendar'
import { MantriMandalaSection } from '@/components/panchang/sections/MantriMandala'
import { RashiNakshatraSection } from '@/components/panchang/sections/RashiNakshatra'
import { RituAyanaSection } from '@/components/panchang/sections/RituAyana'
import { AuspiciousTimingsSection } from '@/components/panchang/sections/AuspiciousTimings'
import { InauspiciousTimingsSection } from '@/components/panchang/sections/InauspiciousTimings'
import { AnandadiYogaSection } from '@/components/panchang/sections/AnandadiYoga'
import { NivasShoolSection } from '@/components/panchang/sections/NivasShool'
import { OtherCalendarsSection } from '@/components/panchang/sections/OtherCalendars'
import { ChandraTaraSection } from '@/components/panchang/sections/ChandraTara'
import { UdayaLagnaSection } from '@/components/panchang/sections/UdayaLagna'
import { FestivalsEventsSection } from '@/components/panchang/sections/FestivalsEvents'
import type { PanchangData } from '@/lib/panchang/types'

const CITY_STORAGE_KEY = 'panchang_last_city'
const DELHI_DEFAULT: City = {
  id: 0,
  city_name: 'Delhi',
  state_name: 'Delhi',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
}

// ── Inner component that uses useSearchParams ─────────────────────────────
function PanchangInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State ──────────────────────────────────────────────────────────────
  const [city, setCity] = useState<City>(DELHI_DEFAULT)
  const [cityDisplay, setCityDisplay] = useState('Delhi, India')
  const [date, setDate] = useState<Date>(new Date())
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_ipDetecting, setIpDetecting] = useState(false)

  // ── Initialise from URL params or localStorage on mount ────────────────
  useEffect(() => {
    const dateParam = searchParams.get('date')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const locationParam = searchParams.get('location')
    const tzParam = searchParams.get('tz')

    // Restore date
    if (dateParam) {
      try { setDate(parseISO(dateParam)) } catch {}
    }

    // Restore city from URL → localStorage → IP detection
    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      if (!isNaN(lat) && !isNaN(lng)) {
        const restored: City = {
          id: 0,
          city_name: locationParam ?? 'Unknown',
          state_name: '',
          country: '',
          latitude: lat,
          longitude: lng,
          timezone: tzParam ?? 'Asia/Kolkata',
        }
        setCity(restored)
        setCityDisplay(locationParam ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`)
        return
      }
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(CITY_STORAGE_KEY)
      if (stored) {
        const parsed: City = JSON.parse(stored)
        setCity(parsed)
        setCityDisplay(`${parsed.city_name}, ${parsed.state_name || parsed.country}`)
        return
      }
    } catch {}

    // Try IP detection
    detectFromIP()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function detectFromIP() {
    setIpDetecting(true)
    try {
      const res = await fetch('/api/panchang/ip-location')
      if (!res.ok) return
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        const detected: City = {
          id: 0,
          city_name: d.city,
          state_name: d.state,
          country: d.country,
          latitude: d.lat,
          longitude: d.lng,
          timezone: d.timezone,
        }
        setCity(detected)
        setCityDisplay(`${d.city}, ${d.state || d.country}`)
      }
    } catch {}
    finally { setIpDetecting(false) }
  }

  // ── Fetch panchang when city or date changes ────────────────────────────
  const fetchPanchang = useCallback(async (c: City, d: Date) => {
    setLoading(true)
    setError(null)
    const dateStr = format(d, 'yyyy-MM-dd')
    const tz = c.timezone || 'Asia/Kolkata'
    try {
      const url = `/api/panchang?date=${dateStr}&lat=${c.latitude}&lng=${c.longitude}&timezone=${encodeURIComponent(tz)}&location=${encodeURIComponent(c.city_name)}`
      const res = await fetch(url)
      const json = await res.json()
      if (!json.success) throw new Error(json.error?.message ?? 'Failed to fetch panchang')
      setPanchangData(json.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load panchang data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPanchang(city, date)
  }, [city, date, fetchPanchang])

  // ── Update URL when city or date changes ────────────────────────────────
  useEffect(() => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const params = new URLSearchParams({
      date: dateStr,
      lat: city.latitude.toString(),
      lng: city.longitude.toString(),
      location: city.city_name,
      tz: city.timezone || 'Asia/Kolkata',
    })
    router.replace(`/panchang?${params.toString()}`, { scroll: false })
  }, [city, date, router])

  // ── City selection ──────────────────────────────────────────────────────
  function handleCitySelect(selected: City) {
    setCity(selected)
    setCityDisplay(`${selected.city_name}, ${selected.state_name || selected.country}`)
    try { localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(selected)) } catch {}
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-6 space-y-6">

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <CitySearch value={cityDisplay} onSelect={handleCitySelect} />
        <DateNavigator
          currentDate={date}
          onDateChange={setDate}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Calculating Panchang…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Data */}
      {!loading && !error && panchangData && (
        <div className="space-y-4">
          <PanchangHeader data={panchangData} dateObj={date} />

          <SunriseMoonriseSection data={panchangData} />
          <PanchaBhujaSection data={panchangData} />
          <LunarCalendarSection data={panchangData} />
          <MantriMandalaSection data={panchangData} />
          <RashiNakshatraSection data={panchangData} />
          <RituAyanaSection data={panchangData} />
          <AuspiciousTimingsSection data={panchangData} />
          <InauspiciousTimingsSection data={panchangData} />
          <AnandadiYogaSection data={panchangData} />
          <NivasShoolSection data={panchangData} />
          <OtherCalendarsSection data={panchangData} />
          <ChandraTaraSection data={panchangData} />
          <UdayaLagnaSection data={panchangData} />
          {panchangData.festivals.length > 0 && <FestivalsEventsSection data={panchangData} />}

          {/* ── Kundli cross-link ── */}
          <div style={{
            padding: '20px 24px',
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'hsl(var(--card))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
                Know your birth chart?
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text2)', margin: 0 }}>
                Today&apos;s Panchang affects you differently based on your Lagna and Moon sign.
              </p>
            </div>
            <Link
              href="/kundli"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 20px',
                background: 'var(--blue)',
                color: '#fff',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Generate free Kundli →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Exported wrapper with Suspense (required for useSearchParams) ──────────
export default function PanchangClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading…</span>
      </div>
    }>
      <PanchangInner />
    </Suspense>
  )
}
