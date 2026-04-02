import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

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

export function AnandadiYogaSection({ data }: { data: PanchangData }) {
  const ay = data.anandadiYoga
  return (
    <CollapsibleSection id="anandadi" title="Anandadi and Tamil Yoga">
      <div className="pt-1">
        <Row
          label="Anandadi Yoga"
          value={ay.name}
          sub={ay.endTime ? `upto ${ay.endTime}` : undefined}
        />
        <div className="flex justify-between items-center py-2 border-b border-border/40 text-sm">
          <span className="text-muted-foreground">Quality</span>
          <span className={cn(
            'text-xs px-2.5 py-0.5 rounded-full font-medium',
            ay.auspicious
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          )}>
            {ay.auspicious ? 'Auspicious' : 'Inauspicious'}
          </span>
        </div>
        <Row label="Jeevanama" value={ay.jeevanama} />
        <Row label="Netrama" value={ay.netrama} />
        <Row
          label="Tamil Yoga"
          value={ay.tamilYogaName}
          sub={ay.tamilYogaEndTime ? `upto ${ay.tamilYogaEndTime}` : undefined}
        />
        <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm">
          <span className="text-muted-foreground">Tamil Quality</span>
          <span className={cn(
            'text-xs px-2.5 py-0.5 rounded-full font-medium',
            ay.tamilYogaAuspicious
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          )}>
            {ay.tamilYogaAuspicious ? 'Auspicious' : 'Inauspicious'}
          </span>
        </div>
      </div>
    </CollapsibleSection>
  )
}
