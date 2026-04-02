import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData, FestivalData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

const TYPE_STYLE: Record<string, string> = {
  major:      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  minor:      'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  fast:       'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  auspicious: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
}

function FestivalCard({ festival }: { festival: FestivalData }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{festival.name}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', TYPE_STYLE[festival.type] ?? TYPE_STYLE.minor)}>
            {festival.type}
          </span>
        </div>
        {festival.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{festival.description}</p>
        )}
      </div>
    </div>
  )
}

export function FestivalsEventsSection({ data }: { data: PanchangData }) {
  const festivals = data.festivals
  if (festivals.length === 0) return null

  return (
    <CollapsibleSection id="festivals" title={`Day Festivals and Events (${festivals.length})`}>
      <div className="grid gap-2 pt-2 grid-cols-1 sm:grid-cols-2">
        {festivals.map(f => (
          <FestivalCard key={f.id} festival={f} />
        ))}
      </div>
    </CollapsibleSection>
  )
}
