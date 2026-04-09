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

/** Multi-line right-aligned cell for values that transition during the day. */
function MultiRow({ label, entries }: { label: string; entries: Array<{ value: string; endTime: string | null }> }) {
  if (entries.length === 1) {
    return (
      <Row
        label={label}
        value={entries[0].value}
        sub={entries[0].endTime ? `upto ${entries[0].endTime}` : undefined}
      />
    )
  }
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right space-y-0.5">
        {entries.map((e, i) => (
          <div key={i}>
            <span className="font-medium">{e.value}</span>
            {e.endTime && (
              <span className="text-xs text-muted-foreground ml-1">upto {e.endTime}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function RashiNakshatraSection({ data }: { data: PanchangData }) {
  const moon = data.moonPosition
  const sun = data.sunPosition

  // ── Chandra Rashi: may change during the day ──────────────────────────────
  const chandraRashiEntries: Array<{ value: string; endTime: string | null }> = [
    { value: `${moon.rashi} (${moon.longitude.toFixed(2)}°)`, endTime: data.moonRashiChangeTime },
  ]
  if (data.moonRashiChangeTime && data.moonRashiAfterChangeName) {
    chandraRashiEntries.push({ value: data.moonRashiAfterChangeName, endTime: null })
  }

  // ── Nakshatra Pada: iterate all nakshatra entries and their padaTransitions ─
  const nakshPadaEntries: Array<{ value: string; endTime: string | null }> = []
  for (const n of data.nakshatra) {
    if (n.padaTransitions && n.padaTransitions.length > 0) {
      for (const pt of n.padaTransitions) {
        nakshPadaEntries.push({ value: `${n.name}, Pada ${pt.pada}`, endTime: pt.endTime })
      }
      // If last transition was pada 3 with a known end time, append implied pada 4
      const lastPt = n.padaTransitions[n.padaTransitions.length - 1]
      if (lastPt.pada === 3 && lastPt.endTime !== null) {
        nakshPadaEntries.push({ value: `${n.name}, Pada 4`, endTime: n.endTime })
      }
    } else {
      // Single pada for this nakshatra
      nakshPadaEntries.push({
        value: `${n.name}, Pada ${n.pada}`,
        endTime: n.endTime,
      })
    }
  }

  // ── Surya Pada: current + next (may cross midnight) ───────────────────────
  const suryaPadaEntries: Array<{ value: string; endTime: string | null }> = [
    { value: `${sun.nakshatraName}, Pada ${sun.pada}`, endTime: data.sunNextPadaTime },
  ]
  if (data.sunNextPadaTime && data.sunNextPadaLabel) {
    suryaPadaEntries.push({ value: data.sunNextPadaLabel, endTime: null })
  }

  return (
    <CollapsibleSection id="rashinakshatra" title="Rashi and Nakshatra">
      <div className="pt-1">
        <MultiRow label="Chandra Rashi (Moon Sign)" entries={chandraRashiEntries} />
        <Row
          label="Surya Rashi (Sun Sign)"
          value={sun.rashi}
          sub={`(${sun.longitude.toFixed(2)}°)`}
        />
        <MultiRow label="Nakshatra Pada" entries={nakshPadaEntries} />
        <Row label="Surya Nakshatra" value={sun.nakshatraName} />
        <MultiRow label="Surya Pada" entries={suryaPadaEntries} />
      </div>
    </CollapsibleSection>
  )
}
