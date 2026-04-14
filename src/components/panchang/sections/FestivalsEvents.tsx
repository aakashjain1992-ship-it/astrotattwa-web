import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData, FestivalData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

const TYPE_STYLE: Record<string, string> = {
  major:      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  minor:      'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  fast:       'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  auspicious: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  purnima:    'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400',
  amavasya:   'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400',
}

const TYPE_LABEL: Record<string, string> = {
  major: 'Major', minor: 'Minor', fast: 'Fast', auspicious: 'Auspicious',
  purnima: 'Purnima', amavasya: 'Amavasya',
}

const TITHI_NAMES = [
  '', 'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
]

function getTithiLabel(n: number): string {
  const paksha = n <= 15 ? 'Shukla' : 'Krishna'
  return `${paksha} ${TITHI_NAMES[n]}`
}

/**
 * Format an ISO UTC string as local time in the given timezone.
 * If the local date differs from festivalDate (YYYY-MM-DD), prefix "MMM D, ".
 */
function formatTithiTime(iso: string, festivalDate: string, timezone: string): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(d)

  const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
  const localDate = `${get('year')}-${get('month')}-${get('day')}`
  const time = `${get('hour')}:${get('minute')} ${get('dayPeriod')}`

  if (localDate !== festivalDate) {
    const dateSuffix = d.toLocaleDateString('en-US', {
      timeZone: timezone, month: 'short', day: 'numeric',
    })
    return `${dateSuffix}, ${time}`
  }
  return time
}

function FestivalCard({ festival, timezone }: { festival: FestivalData; timezone: string }) {
  const hasTithi = festival.tithi_number && festival.tithi_start && festival.tithi_end

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{festival.name}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', TYPE_STYLE[festival.type] ?? TYPE_STYLE.minor)}>
            {TYPE_LABEL[festival.type] ?? festival.type}
          </span>
        </div>

        {/* Tithi window */}
        {hasTithi && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-foreground/60">{getTithiLabel(festival.tithi_number!)}</span>
            <span className="mx-1.5 opacity-40">·</span>
            {formatTithiTime(festival.tithi_start!, festival.date, timezone)}
            <span className="mx-1 opacity-40">→</span>
            {formatTithiTime(festival.tithi_end!, festival.date, timezone)}
          </p>
        )}

        {festival.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{festival.description}</p>
        )}
      </div>
    </div>
  )
}

export function FestivalsEventsSection({ data }: { data: PanchangData }) {
  const festivals = data.festivals
  if (festivals.length === 0) return null

  return (
    <CollapsibleSection id="festivals" title={`Festivals & Events (${festivals.length})`}>
      <div className="grid gap-2 pt-2 grid-cols-1 sm:grid-cols-2">
        {festivals.map(f => (
          <FestivalCard key={f.id} festival={f} timezone={data.timezone} />
        ))}
      </div>
    </CollapsibleSection>
  )
}
