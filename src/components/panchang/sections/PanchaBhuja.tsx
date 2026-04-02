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
          <MultiEntry entries={data.nakshatra.map(n => ({
            name: `${n.name} (Pada ${n.pada})`,
            endTime: n.endTime,
          }))} />
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
