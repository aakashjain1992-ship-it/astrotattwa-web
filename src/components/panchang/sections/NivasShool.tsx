import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData, TimedEntry } from '@/lib/panchang/types'

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

/** Collapse consecutive entries with the same value into one (keep the last endTime). */
function dedupeTimedEntries(entries: TimedEntry[]): TimedEntry[] {
  const result: TimedEntry[] = []
  for (const entry of entries) {
    const last = result[result.length - 1]
    if (last && last.value === entry.value) {
      result[result.length - 1] = { value: last.value, endTime: entry.endTime }
    } else {
      result.push(entry)
    }
  }
  return result
}

function TimedRow({ label, entries }: { label: string; entries: TimedEntry[] }) {
  if (entries.length === 1) {
    return <Row label={label} value={entries[0].value} sub={entries[0].endTime ? `upto ${entries[0].endTime}` : undefined} />
  }
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right max-w-[55%] space-y-0.5">
        {entries.map((e, i) => (
          <div key={i}>
            <span className="font-medium">{e.value}</span>
            {e.endTime && <span className="text-xs text-muted-foreground ml-1">upto {e.endTime}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function NivasShoolSection({ data }: { data: PanchangData }) {
  const ns = data.nivasShool
  const agnivasa = dedupeTimedEntries(ns.agnivasa)
  return (
    <CollapsibleSection id="nivasshool" title="Nivas and Shool">
      <div className="pt-1">
        {/* Hide Homahuti when nakshatra is unknown (returns '') */}
        {ns.homahuti && (
          <Row label="Homahuti" value={ns.homahuti} sub="Planet for fire ritual" />
        )}
        <Row
          label="Disha Shool"
          value={ns.dishashool}
          sub={`Avoid travel. Remedy: ${ns.dishashoolRemedy}`}
        />
        {/* Hide Agnivasa when tithi is unknown (empty array) */}
        {agnivasa.length > 0 && (
          <TimedRow label="Agnivasa" entries={agnivasa} />
        )}
        <TimedRow label="Chandra Vasa" entries={ns.chandravasa} />
        <Row label="Rahu Vasa" value={ns.rahuvasa} />
        <TimedRow label="Shivavasa" entries={ns.shivavasa} />
        <Row label="Kumbha Chakra" value={ns.kumbhachakra} />
      </div>
    </CollapsibleSection>
  )
}
