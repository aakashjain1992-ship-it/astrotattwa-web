'use client'

import { useTheme } from '@/components/theme-provider'
import type { YogaDisplayCard } from '@/lib/astrology/yogas/types'
import { EmptyState } from './EmptyState'

interface TopPositiveYogasProps {
  items: YogaDisplayCard[]
  emptyMessage: string | null
}

export function TopPositiveYogas({ items, emptyMessage }: TopPositiveYogasProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  if (items.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Top Positive Yogas</h3>
        <EmptyState message={emptyMessage ?? 'No positive yogas detected in this chart.'} />
      </section>
    )
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Top Positive Yogas</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl p-4"
            style={{ background: 'hsl(var(--card))', border: `1px solid ${tw(0.1)}` }}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.name}</span>
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {item.label}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{item.shortMeaning}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
