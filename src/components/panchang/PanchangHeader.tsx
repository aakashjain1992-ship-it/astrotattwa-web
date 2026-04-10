'use client'
import { MapPin } from 'lucide-react'
import type { PanchangData } from '@/lib/panchang/types'
import { SpecialYogasPills } from './SpecialYogasPills'

// Simple SVG moon phase based on tithi number
function MoonPhase({ tithiNumber }: { tithiNumber: number }) {
  // Simple circular representation with illumination
  const isWaxing = tithiNumber <= 15
  const illumination = tithiNumber <= 15 ? tithiNumber / 15 : (30 - tithiNumber) / 15

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full">
        {/* Dark circle base */}
        <circle cx="24" cy="24" r="20" fill="#1e293b" />
        {/* Illuminated part via clip */}
        {tithiNumber === 15 ? (
          <circle cx="24" cy="24" r="20" fill="#fbbf24" opacity="0.9" />
        ) : tithiNumber === 30 ? (
          <circle cx="24" cy="24" r="20" fill="#1e293b" />
        ) : isWaxing ? (
          <>
            <clipPath id={`wax-${tithiNumber}`}>
              <rect x={24 - 20 * illumination} y="4" width={20 * illumination * 2} height="40" />
            </clipPath>
            <circle cx="24" cy="24" r="20" fill="#fbbf24" opacity="0.85" clipPath={`url(#wax-${tithiNumber})`} />
          </>
        ) : (
          <>
            <clipPath id={`wan-${tithiNumber}`}>
              <rect x="4" y="4" width={20 * illumination * 2} height="40" />
            </clipPath>
            <circle cx="24" cy="24" r="20" fill="#fbbf24" opacity="0.85" clipPath={`url(#wan-${tithiNumber})`} />
          </>
        )}
      </svg>
    </div>
  )
}

interface PanchangHeaderProps {
  data: PanchangData
  dateObj: Date
}

export function PanchangHeader({ data, dateObj }: PanchangHeaderProps) {
  const lc = data.lunarCalendar
  const tithi = data.tithi[0]
  const tithiNumber = tithi?.number ?? 1

  const dayNum = dateObj.getDate()
  const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5">
      <div className="flex items-start gap-4">
        <MoonPhase tithiNumber={tithiNumber} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            {/* Left: Lunar info */}
            <div>
              <div className="text-sm text-muted-foreground">
                {lc.pravishte}, {lc.chandramasaPurnimanta}
              </div>
              <div className="font-semibold text-base leading-tight">
                {tithi?.paksha} Paksha, {tithi?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {lc.vikramSamvat} {lc.vikramSamvatName}, Vikrama Samvat
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{data.locationName || `${data.lat.toFixed(2)}, ${data.lng.toFixed(2)}`}</span>
              </div>
            </div>

            {/* Right: Gregorian date */}
            <div className="text-right shrink-0">
              <div className="text-4xl font-bold leading-none">{String(dayNum).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">{monthYear}</div>
              <div className="text-sm font-medium">{weekday}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special yogas + festivals pills */}
      {(data.specialYogas.length > 0 || data.festivals.length > 0) && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <SpecialYogasPills data={data} />
        </div>
      )}
    </div>
  )
}
