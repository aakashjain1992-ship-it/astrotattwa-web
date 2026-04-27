'use client'

import { useTheme } from '@/components/theme-provider'
import type { YogaDisplayCard } from '@/lib/astrology/yogas/types'
import { EmptyState } from './EmptyState'

interface ChallengingPatternsProps {
  items: YogaDisplayCard[]
  emptyMessage: string | null
}

export function ChallengingPatterns({ items, emptyMessage }: ChallengingPatternsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const tw = (a: number) => isDark ? `rgba(255,255,255,${a})` : `rgba(13,17,23,${a})`

  if (items.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Challenging Patterns</h3>
        <EmptyState message={emptyMessage ?? 'No challenging patterns detected in this chart.'} />
      </section>
    )
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Challenging Patterns</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl p-4"
            style={{ background: 'hsl(var(--card))', border: `1px solid ${tw(0.1)}` }}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.name}</span>
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
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
