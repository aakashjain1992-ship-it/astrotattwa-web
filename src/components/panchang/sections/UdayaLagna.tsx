import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

const PANCHAKA_STYLE: Record<string, string> = {
  good:   'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  roga:   'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  mrityu: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  agni:   'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  raja:   'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  chora:  'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
}

const PANCHAKA_LABEL: Record<string, string> = {
  good: '✓ Good', roga: 'Roga', mrityu: 'Mrityu', agni: 'Agni', raja: '⚠ Raja', chora: 'Chora',
}

export function UdayaLagnaSection({ data }: { data: PanchangData }) {
  const slots = data.udayaLagnaSlots
  return (
    <CollapsibleSection id="udayalagna" title="Panchaka Rahita Muhurta and Udaya Lagna">
      <div className="pt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 text-muted-foreground font-medium">Lagna</th>
              <th className="text-left pb-2 text-muted-foreground font-medium">Time Range</th>
              <th className="text-left pb-2 text-muted-foreground font-medium">Muhurta</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                <td className="py-2 font-medium">{slot.lagnaName}</td>
                <td className="py-2 text-muted-foreground font-mono text-xs">
                  {slot.startTime} – {slot.endTime}
                </td>
                <td className="py-2">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    PANCHAKA_STYLE[slot.panchakaType]
                  )}>
                    {PANCHAKA_LABEL[slot.panchakaType]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Lagna data unavailable for this date/location.
          </p>
        )}
      </div>
    </CollapsibleSection>
  )
}
