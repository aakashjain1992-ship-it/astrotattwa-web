import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium font-mono text-xs">{value}</span>
    </div>
  )
}

export function OtherCalendarsSection({ data }: { data: PanchangData }) {
  const oc = data.otherCalendars
  return (
    <CollapsibleSection id="othercalendars" title="Other Calendars and Epoch" defaultOpen={false}>
      <div className="pt-1">
        <Row label="Kaliyuga (years elapsed)" value={oc.kaliyuga} />
        <Row label="Kali Ahargana (days)" value={oc.kaliAhargana.toLocaleString()} />
        <Row label="Julian Date" value={oc.julianDate} />
        <Row label="Julian Day Number" value={oc.julianDay.toLocaleString()} />
        <Row label="Lahiri Ayanamsha" value={`${oc.lahiriAyanamsha.toFixed(6)}°`} />
        <Row label="National Civil Date (Saka)" value={oc.nationalCivilDate} />
        <Row label="Rata Die" value={oc.rataDie.toLocaleString()} />
        <Row label="Modified Julian Day" value={oc.modifiedJulianDay.toFixed(2)} />
      </div>
    </CollapsibleSection>
  )
}
