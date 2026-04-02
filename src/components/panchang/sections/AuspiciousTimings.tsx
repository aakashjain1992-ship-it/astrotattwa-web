import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData, AuspiciousTiming } from '@/lib/panchang/types'

function TimingRow({
  label, timing, description,
}: {
  label: string
  timing: AuspiciousTiming | null
  description?: string
}) {
  if (!timing) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-border/40 last:border-0">
      <div className="sm:w-52 shrink-0">
        <span className="text-sm font-medium">{label}</span>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full">
          {timing.start} – {timing.end}
        </span>
      </div>
    </div>
  )
}

export function AuspiciousTimingsSection({ data }: { data: PanchangData }) {
  return (
    <CollapsibleSection id="auspicious" title="Auspicious Timings">
      <div className="pt-1">
        <TimingRow label="Brahma Muhurta" timing={data.brahmaMuhurta} description="1h 36m before sunrise" />
        <TimingRow label="Pratah Sandhya" timing={data.pratahSandhya} description="48min before sunrise" />
        <TimingRow label="Abhijit Muhurta" timing={data.abhijitMuhurta} description="Local noon ± 24min" />
        <TimingRow label="Vijaya Muhurta" timing={data.vijayaMuhurta} description="48min before sunset" />
        <TimingRow label="Godhuli Muhurta" timing={data.godhuliMuhurta} description="Around sunset" />
        <TimingRow label="Sayahna Sandhya" timing={data.sayahnaSandhya} description="After sunset" />
        <TimingRow label="Amrit Kalam" timing={data.amritKalam} description="Nakshatra-based nectar time" />
        <TimingRow label="Nishita Muhurta" timing={data.nishitaMuhurta} description="Midnight ± 24min" />
      </div>
    </CollapsibleSection>
  )
}
