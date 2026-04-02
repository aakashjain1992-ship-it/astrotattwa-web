import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData, InauspiciousTiming, AuspiciousTiming } from '@/lib/panchang/types'

function BadRow({
  label, timing, description,
}: {
  label: string
  timing: InauspiciousTiming | AuspiciousTiming | null
  description?: string
}) {
  if (!timing) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-border/40 last:border-0">
      <div className="sm:w-52 shrink-0">
        <span className="text-sm font-medium">{label}</span>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <span className="text-sm text-red-700 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-full">
        {timing.start} – {timing.end}
      </span>
    </div>
  )
}

export function InauspiciousTimingsSection({ data }: { data: PanchangData }) {
  return (
    <CollapsibleSection id="inauspicious" title="Inauspicious Timings">
      <div className="pt-1">
        <BadRow label="Rahu Kalam" timing={data.rahuKalam} description="Avoid for new work" />
        <BadRow label="Yamaganda" timing={data.yamaganda} description="Avoid for important tasks" />
        <BadRow label="Gulikai Kalam" timing={data.gulikaiKalam} description="Saturn's bad period" />
        {data.durMuhurtam.map((t, i) => (
          <BadRow key={i} label={`Dur Muhurtam ${i + 1}`} timing={t} description="Inauspicious muhurta" />
        ))}
        <BadRow label="Varjyam" timing={data.varjyam} description="Forbidden period" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 text-sm">
          <span className="sm:w-52 shrink-0 font-medium text-muted-foreground">Baana</span>
          <span className="font-medium">{data.baana}</span>
        </div>
      </div>
    </CollapsibleSection>
  )
}
