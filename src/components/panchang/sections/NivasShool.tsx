import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right max-w-[55%]">
        <span className="font-medium">{value}</span>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}

export function NivasShoolSection({ data }: { data: PanchangData }) {
  const ns = data.nivasShool
  return (
    <CollapsibleSection id="nivasshool" title="Nivas and Shool">
      <div className="pt-1">
        <Row label="Homahuti" value={ns.homahuti} sub="Planet for fire ritual" />
        <Row
          label="Disha Shool"
          value={ns.dishashool}
          sub={`Avoid travel. Remedy: ${ns.dishashoolRemedy}`}
        />
        <Row
          label="Agnivasa"
          value={ns.agnivasa}
          sub={ns.agnivisaEndTime ? `upto ${ns.agnivisaEndTime}` : undefined}
        />
        <Row
          label="Chandra Vasa"
          value={ns.chandravasa}
          sub={ns.chandravaisaEndTime ? `upto ${ns.chandravaisaEndTime}` : undefined}
        />
        <Row label="Rahu Vasa" value={ns.rahuvasa} />
        <Row
          label="Shivavasa"
          value={ns.shivavasa}
          sub={ns.shivavasaEndTime ? `upto ${ns.shivavasaEndTime}` : undefined}
        />
        <Row label="Kumbha Chakra" value={ns.kumbhachakra} />
      </div>
    </CollapsibleSection>
  )
}
