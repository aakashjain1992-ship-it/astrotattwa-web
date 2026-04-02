import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function RituAyanaSection({ data }: { data: PanchangData }) {
  const ra = data.rituAyana
  return (
    <CollapsibleSection id="rituayana" title="Ritu and Ayana">
      <div className="pt-1">
        <Row label="Drik Ritu" value={ra.drikRitu} />
        <Row label="Vedic Ritu" value={ra.vedicRitu} />
        <Row label="Drik Ayana" value={ra.drikAyana} />
        <Row label="Vedic Ayana" value={ra.vedicAyana} />
        <Row label="Madhyahna (Local Noon)" value={ra.madhyahna} />
        <Row label="Dinamana (Day Duration)" value={ra.dinamana} />
        <Row label="Ratrimana (Night Duration)" value={ra.ratrimana} />
      </div>
    </CollapsibleSection>
  )
}
