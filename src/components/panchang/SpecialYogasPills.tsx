import type { PanchangData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

export function SpecialYogasPills({ data }: { data: PanchangData }) {
  const items = [
    ...data.specialYogas.map(y => ({ label: y.name, auspicious: y.auspicious })),
    ...data.festivals.map(f => ({ label: f.name, auspicious: true })),
  ]

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={cn(
            'text-xs px-3 py-1 rounded-full font-medium border',
            item.auspicious
              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'
          )}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}
