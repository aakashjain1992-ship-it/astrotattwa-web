import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-medium">{value}</span>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}

export function RashiNakshatraSection({ data }: { data: PanchangData }) {
  const moon = data.moonPosition
  const sun = data.sunPosition
  return (
    <CollapsibleSection id="rashinakshatra" title="Rashi and Nakshatra">
      <div className="pt-1">
        <Row
          label="Chandra Rashi (Moon Sign)"
          value={moon.rashi}
          sub={`(${moon.longitude.toFixed(2)}°)`}
        />
        <Row
          label="Surya Rashi (Sun Sign)"
          value={sun.rashi}
          sub={`(${sun.longitude.toFixed(2)}°)`}
        />
        <Row
          label="Nakshatra Pada"
          value={`${moon.nakshatraName}, Pada ${moon.pada}`}
          sub={data.nakshatra[0]?.endTime ? `upto ${data.nakshatra[0].endTime}` : undefined}
        />
        <Row label="Surya Nakshatra" value={sun.nakshatraName} />
        <Row label="Surya Pada" value={`Pada ${sun.pada}`} />
      </div>
    </CollapsibleSection>
  )
}
