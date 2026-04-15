'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/theme-provider'

const DELHI = { lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata', location: 'New Delhi, India' }

interface TimeRange { start: string; end: string }

interface PanchangSnap {
  location:         string
  date:             string
  tithi:            { name: string; paksha: string; endTime: string | null }
  nakshatra:        { name: string; pada: number;   endTime: string | null }
  yoga:             { name: string; endTime: string | null }
  karanas:          { name: string; endTime: string | null }[]
  vara:             string
  monthAmanta:      string
  monthPurnimanta:  string
  vikramSamvat:     number
  sunrise:          string
  sunset:           string
  rahuKalam:        TimeRange | null
  brahmaMuhurta:    TimeRange | null
  abhijitMuhurta:   TimeRange | null
  vijayaMuhurta:    TimeRange | null
  amritKalam:       TimeRange | null
}

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${d} ${months[m - 1]} ${y}`
}

function fmtRange(r: TimeRange): string { return `${r.start} – ${r.end}` }

async function fetchPanchang(lat: number, lng: number, tz: string, loc: string): Promise<PanchangSnap> {
  const dateStr = todayIST()
  const url = `/api/panchang?date=${dateStr}&lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&timezone=${encodeURIComponent(tz)}&location=${encodeURIComponent(loc)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('panchang fetch failed')
  const json = await res.json()
  const d = json.data ?? json
  return {
    location:        loc,
    date:            formatDate(dateStr),
    tithi:           { name: d.tithi?.[0]?.name ?? '—', paksha: d.tithi?.[0]?.paksha ?? '', endTime: d.tithi?.[0]?.endTime ?? null },
    nakshatra:       { name: d.nakshatra?.[0]?.name ?? '—', pada: d.nakshatra?.[0]?.pada ?? 1, endTime: d.nakshatra?.[0]?.endTime ?? null },
    yoga:            { name: d.yoga?.[0]?.name ?? '—', endTime: d.yoga?.[0]?.endTime ?? null },
    karanas:         (d.karana ?? []).slice(0, 2).map((k: { name: string; endTime: string | null }) => ({ name: k.name, endTime: k.endTime })),
    vara:            d.vara?.name ?? '—',
    monthAmanta:     d.lunarCalendar?.chandramasaAmanta ?? '—',
    monthPurnimanta: d.lunarCalendar?.chandramasaPurnimanta ?? '—',
    vikramSamvat:    d.lunarCalendar?.vikramSamvat ?? 0,
    sunrise:         d.sunrise ?? '—',
    sunset:          d.sunset ?? '—',
    rahuKalam:       d.rahuKalam ?? null,
    brahmaMuhurta:   d.brahmaMuhurta ?? null,
    abhijitMuhurta:  d.abhijitMuhurta ?? null,
    vijayaMuhurta:   d.vijayaMuhurta ?? null,
    amritKalam:      d.amritKalam ?? null,
  }
}

export function PanchangTeaser() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  const [data, setData]       = useState<PanchangSnap | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    function load(lat: number, lng: number, tz: string, loc: string) {
      fetchPanchang(lat, lng, tz, loc)
        .then(snap => { if (!cancelled) { setData(snap); setLoading(false) } })
        .catch(() => { if (!cancelled) setLoading(false) })
    }

    async function run() {
      let ipLat = DELHI.lat, ipLng = DELHI.lng, ipTz = DELHI.timezone, ipCity = DELHI.location
      try {
        const res = await fetch('/api/panchang/ip-location')
        if (res.ok) {
          const json = await res.json()
          const d = json.data ?? json
          ipCity = [d.city, d.country].filter(Boolean).join(', ') || DELHI.location
          ipLat  = d.lat      ?? DELHI.lat
          ipLng  = d.lng      ?? DELHI.lng
          ipTz   = d.timezone ?? DELHI.timezone
        }
      } catch { /* use Delhi defaults */ }

      if (!navigator.geolocation) { load(ipLat, ipLng, ipTz, ipCity); return }

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled) return
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ipTz
          load(pos.coords.latitude, pos.coords.longitude, tz, ipCity)
        },
        () => { if (!cancelled) load(ipLat, ipLng, ipTz, ipCity) },
        { timeout: 5000, maximumAge: 300_000 },
      )
    }

    run()
    return () => { cancelled = true }
  }, [])

  if (!loading && !data) return null

  const auspicious = data ? [
    { label: 'Brahma Muhurta', value: data.brahmaMuhurta ? fmtRange(data.brahmaMuhurta) : null },
    { label: 'Abhijit',        value: data.abhijitMuhurta ? fmtRange(data.abhijitMuhurta) : null },
    { label: 'Vijaya',         value: data.vijayaMuhurta  ? fmtRange(data.vijayaMuhurta)  : null },
    { label: 'Amrit Kalam',    value: data.amritKalam     ? fmtRange(data.amritKalam)     : null },
  ].filter(a => a.value) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Eyebrow */}
      <span style={{ fontSize: '10.5px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '6px', display: 'block' }}>
        ✦ Panchang
      </span>

      {/* Title */}
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(20px,1.8vw,27px)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, margin: '0 0 6px' }}>
        Today&apos;s Cosmic Calendar
      </h2>

      {loading ? <PanchangSkeleton tw={tw} /> : data ? (
        <>
          {/* Location + date */}
          <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '0 0 16px', letterSpacing: '.2px' }}>
            {data.location} · {data.date}
          </p>

          {/* Panchang detail rows */}
          <div style={{ border: `1px solid ${tw(.08)}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
            <DetailRow label="Tithi"    value={`${data.tithi.paksha} ${data.tithi.name}`}             endTime={data.tithi.endTime}    tw={tw} />
            <DetailRow label="Nakshatra" value={`${data.nakshatra.name} (Pada ${data.nakshatra.pada})`} endTime={data.nakshatra.endTime} tw={tw} alt />
            <DetailRow label="Yoga"     value={data.yoga.name}                                          endTime={data.yoga.endTime}      tw={tw} />
            {data.karanas.map((k, i) => (
              <DetailRow key={i} label={i === 0 ? 'Karana' : ''} value={k.name} endTime={k.endTime} tw={tw} alt={i % 2 === 0} />
            ))}
            <DetailRow label="Vara"     value={data.vara}                                               endTime={null}                   tw={tw} alt />
          </div>

          {/* Lunar calendar */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '10px 14px', background: tw(.025), border: `1px solid ${tw(.07)}`, borderRadius: '10px', marginBottom: '8px', fontSize: '12px', color: 'var(--text3)' }}>
            <span>Month (Amanta): <strong style={{ color: 'var(--text2)', fontWeight: 500 }}>{data.monthAmanta}</strong></span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>Month (Purnimanta): <strong style={{ color: 'var(--text2)', fontWeight: 500 }}>{data.monthPurnimanta}</strong></span>
            {data.vikramSamvat > 0 && <><span style={{ opacity: 0.3 }}>·</span><span>Samvat: <strong style={{ color: 'var(--text2)', fontWeight: 500 }}>{data.vikramSamvat}</strong></span></>}
          </div>

          {/* Sun / Rahu timings */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', padding: '12px 14px', background: tw(.025), border: `1px solid ${tw(.07)}`, borderRadius: '10px', marginBottom: '8px' }}>
            <Chip icon="🌅" label="Sunrise"    value={data.sunrise} />
            <Sep tw={tw} />
            <Chip icon="🌇" label="Sunset"     value={data.sunset} />
            {data.rahuKalam && <><Sep tw={tw} /><Chip icon="⚠" label="Rahu Kalam" value={`${data.rahuKalam.start}–${data.rahuKalam.end}`} warn /></>}
          </div>

          {/* Auspicious timings */}
          {auspicious.length > 0 && (
            <div style={{ border: `1px solid ${tw(.08)}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '9px 16px', borderBottom: `1px solid ${tw(.06)}`, background: 'rgba(212,160,23,.06)' }}>
                <span style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--blue)' }}>
                  ✦ Auspicious Timings
                </span>
              </div>
              {auspicious.map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < auspicious.length - 1 ? `1px solid ${tw(.05)}` : 'none', background: i % 2 ? tw(.02) : 'transparent' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 500, opacity: 0.9 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <Link
          href="/panchang"
          style={{ display: 'block', textAlign: 'center', background: isDark ? 'transparent' : 'var(--blue)', color: isDark ? 'var(--blue)' : '#fff', fontWeight: 600, fontSize: '14px', letterSpacing: '.3px', padding: '13px 0', borderRadius: '10px', border: '1.5px solid var(--blue)', textDecoration: 'none', transition: 'background .18s, color .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'transparent' : 'var(--blue)'; e.currentTarget.style.color = isDark ? 'var(--blue)' : '#fff' }}
        >
          See Full Panchang →
        </Link>
      </div>
    </div>
  )
}

function DetailRow({ label, value, endTime, alt, tw }: { label: string; value: string; endTime: string | null; alt?: boolean; tw: (a: number) => string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '11px 16px', background: alt ? tw(.025) : 'transparent', borderBottom: `1px solid ${tw(.05)}`, gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', minWidth: 0 }}>
        <span style={{ fontSize: '9.5px', fontWeight: 600, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text3)', flexShrink: 0, width: '72px' }}>{label}</span>
        <span style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 500 }}>{value}</span>
      </div>
      {endTime && <span style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 500, flexShrink: 0, opacity: 0.85 }}>upto {endTime}</span>}
    </div>
  )
}

function Chip({ icon, label, value, warn }: { icon: string; label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '13px', opacity: warn ? 1 : 0.65 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: warn ? '#F87171' : 'var(--text3)' }}>{label}</div>
        <div style={{ fontSize: '12.5px', fontWeight: 500, color: warn ? '#EF4444' : 'var(--text2)' }}>{value}</div>
      </div>
    </div>
  )
}

function Sep({ tw }: { tw: (a: number) => string }) {
  return <div style={{ width: '1px', height: '24px', background: tw(.08), flexShrink: 0, alignSelf: 'center' }} />
}

function PanchangSkeleton({ tw }: { tw: (a: number) => string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <div style={{ height: '12px', width: '180px', background: tw(.06), borderRadius: '3px', marginBottom: '4px' }} />
      <div style={{ border: `1px solid ${tw(.08)}`, borderRadius: '12px', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ padding: '11px 16px', borderBottom: `1px solid ${tw(.05)}`, background: i % 2 ? tw(.02) : 'transparent', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: '13px', width: `${35 + i * 8}%`, background: tw(.06), borderRadius: '3px' }} />
            <div style={{ height: '11px', width: '60px', background: tw(.04), borderRadius: '2px' }} />
          </div>
        ))}
      </div>
      <div style={{ height: '36px', background: tw(.025), borderRadius: '10px', border: `1px solid ${tw(.07)}` }} />
      <div style={{ height: '44px', background: tw(.025), borderRadius: '10px', border: `1px solid ${tw(.07)}` }} />
      <div style={{ border: `1px solid ${tw(.08)}`, borderRadius: '12px', overflow: 'hidden' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ padding: '10px 16px', borderBottom: i < 2 ? `1px solid ${tw(.05)}` : 'none', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ height: '12px', width: '40%', background: tw(.05), borderRadius: '3px' }} />
            <div style={{ height: '12px', width: '35%', background: 'rgba(212,160,23,0.1)', borderRadius: '3px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
