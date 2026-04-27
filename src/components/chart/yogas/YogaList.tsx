'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { YogaResult, DoshaResult, YogaCategory } from '@/lib/astrology/yogas/types'
import { YogaCard } from './YogaCard'
import { DoshaCard } from './DoshaCard'
import { EmptyState } from './EmptyState'

interface YogaListProps {
  yogas: YogaResult[]
  doshas: DoshaResult[]
}

const CATEGORY_ORDER: YogaCategory[] = ['mahapurusha', 'raja', 'dhana', 'vipreet_raja', 'moon', 'marriage', 'career', 'general']

const CATEGORY_LABELS: Record<YogaCategory, string> = {
  mahapurusha: 'Pancha Mahapurusha',
  raja: 'Raja Yogas',
  dhana: 'Dhana Yogas',
  vipreet_raja: 'Vipreet Raja',
  moon: 'Moon Yogas',
  marriage: 'Marriage Yogas',
  career: 'Career Yogas',
  general: 'General Yogas',
  dosha: 'Doshas',
}

function CategoryGroup({ category, items }: { category: YogaCategory; items: YogaResult[] }) {
  const [open, setOpen] = useState(true)
  if (items.length === 0) return null
  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-between w-full text-left py-2 mb-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
          {CATEGORY_LABELS[category]} <span className="ml-1 font-normal">({items.length})</span>
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--text3)' }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text3)' }} />}
      </button>
      {open && (
        <div className="space-y-3">
          {items.map((y) => <YogaCard key={y.id} yoga={y} />)}
        </div>
      )}
    </div>
  )
}

export function YogaList({ yogas, doshas }: YogaListProps) {
  const [activeTab, setActiveTab] = useState<'yogas' | 'doshas'>('yogas')

  const grouped = CATEGORY_ORDER.reduce<Record<string, YogaResult[]>>((acc, cat) => {
    acc[cat] = yogas.filter((y) => y.category === cat)
    return acc
  }, {})

  const hasYogas = yogas.length > 0
  const hasDoshas = doshas.length > 0

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit mb-5">
        {(['yogas', 'doshas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === t
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'yogas' ? `Yogas (${yogas.length})` : `Doshas (${doshas.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'yogas' && (
        hasYogas ? (
          <div className="space-y-5">
            {CATEGORY_ORDER.map((cat) => (
              <CategoryGroup key={cat} category={cat} items={grouped[cat] ?? []} />
            ))}
          </div>
        ) : (
          <EmptyState message="No yogas detected in this chart." />
        )
      )}

      {activeTab === 'doshas' && (
        hasDoshas ? (
          <div className="space-y-3">
            {doshas.map((d) => <DoshaCard key={d.id} dosha={d} />)}
          </div>
        ) : (
          <EmptyState message="No doshas detected in this chart." />
        )
      )}
    </div>
  )
}
