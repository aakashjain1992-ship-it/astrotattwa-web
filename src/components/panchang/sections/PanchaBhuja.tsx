import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

function MultiEntry({ entries }: { entries: Array<{ name: string; endTime: string | null }> }) {
  return (
    <div className="space-y-0.5">
      {entries.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <span className="font-medium">{e.name}</span>
          {e.endTime && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">upto {e.endTime}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground sm:w-36 shrink-0">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function PanchaBhujaSection({ data }: { data: PanchangData }) {
  return (
    <CollapsibleSection id="panchabhuja" title="Panchang">
      <div className="divide-y divide-border/40 pt-1">
        <Row label="Tithi">
          <MultiEntry entries={data.tithi.map(t => ({
            name: `${t.name} (${t.paksha})`,
            endTime: t.endTime,
          }))} />
        </Row>
        <Row label="Nakshatra">
          <div className="space-y-0.5">
            {data.nakshatra.map((n, ni) => {
              // If pada transitions exist, render each pada separately
              if (n.padaTransitions && n.padaTransitions.length > 0) {
                const lastPt = n.padaTransitions[n.padaTransitions.length - 1]
                // Only append Pada 4 if padas 1–3 all completed within the day
                // (last transition was pada 3 and has a non-null end time)
                const showFinalPada4 = lastPt.pada === 3 && lastPt.endTime !== null
                return (
                  <div key={ni} className="space-y-0.5">
                    {n.padaTransitions.map((pt, pi) => (
                      <div key={pi} className="flex items-center justify-between gap-2">
                        <span className="font-medium">{n.name} Pada {pt.pada}</span>
                        {pt.endTime && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">upto {pt.endTime}</span>
                        )}
                      </div>
                    ))}
                    {showFinalPada4 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{n.name} Pada 4</span>
                        {n.endTime && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">upto {n.endTime}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }
              // Simple display: single pada
              return (
                <div key={ni} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{n.name} (Pada {n.pada})</span>
                  {n.endTime && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">upto {n.endTime}</span>
                  )}
                </div>
              )
            })}
          </div>
        </Row>
        <Row label="Yoga">
          <MultiEntry entries={data.yoga.map(y => ({
            name: `${y.name}${!y.auspicious ? ' ⚠️' : ''}`,
            endTime: y.endTime,
          }))} />
        </Row>
        <Row label="Karana">
          <MultiEntry entries={data.karana} />
        </Row>
        <Row label="Vara">
          <span className="font-medium">{data.vara.name}</span>
          <span className="text-muted-foreground ml-2 text-xs">({data.vara.ruling_planet})</span>
        </Row>
        <Row label="Paksha">
          <span className={cn('font-medium', data.paksha === 'Shukla' ? 'text-amber-600' : 'text-slate-600')}>
            {data.paksha} Paksha
          </span>
        </Row>
      </div>
    </CollapsibleSection>
  )
}
