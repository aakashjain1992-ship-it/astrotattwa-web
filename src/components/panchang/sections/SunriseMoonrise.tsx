import { Sunrise, Sunset, Moon, MoonStar } from 'lucide-react'
import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

export function SunriseMoonriseSection({ data }: { data: PanchangData }) {
  const items = [
    { icon: <Sunrise className="h-5 w-5 text-amber-500" />, label: 'Sunrise', value: data.sunrise },
    { icon: <Sunset className="h-5 w-5 text-orange-500" />, label: 'Sunset', value: data.sunset },
    { icon: <Moon className="h-5 w-5 text-blue-400" />, label: 'Moonrise', value: data.moonrise ?? '—' },
    { icon: <MoonStar className="h-5 w-5 text-slate-400" />, label: 'Moonset', value: data.moonset ?? 'No Moonset' },
  ]
  return (
    <CollapsibleSection id="sunrise" title="Sunrise and Moonrise">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {items.map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/30 text-center">
            {icon}
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-semibold text-sm">{value}</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  )
}
