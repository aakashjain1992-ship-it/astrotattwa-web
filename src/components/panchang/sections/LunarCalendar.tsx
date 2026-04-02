import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

export function LunarCalendarSection({ data }: { data: PanchangData }) {
  const { lunarCalendar: lc } = data
  return (
    <CollapsibleSection id="lunar" title="Lunar Month, Samvat and Samvatsara">
      <div className="pt-1">
        <Row label="Vikram Samvat" value={`${lc.vikramSamvat} — ${lc.vikramSamvatName}`} />
        <Row label="Shaka Samvat" value={lc.shakaSamvat} />
        <Row label="Gujarati Samvat" value={lc.gujaratiSamvat} />
        <Row label="Chandramasa (Purnimanta)" value={lc.chandramasaPurnimanta} />
        <Row label="Chandramasa (Amanta)" value={lc.chandramasaAmanta} />
        <Row label="Pravishte / Gate" value={`${lc.pravishte} days elapsed`} />
      </div>
    </CollapsibleSection>
  )
}
