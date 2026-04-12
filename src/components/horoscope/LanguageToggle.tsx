'use client'

import type { HoroscopeLang } from '@/types/horoscope'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  value: HoroscopeLang
  onChange: (v: HoroscopeLang) => void
}

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-sm">
      <button
        onClick={() => onChange('en')}
        className={cn(
          'px-3 py-1.5 rounded-md transition-all duration-150 font-medium',
          value === 'en'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        onClick={() => onChange('hi')}
        className={cn(
          'px-3 py-1.5 rounded-md transition-all duration-150 font-medium',
          value === 'hi'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        हि
      </button>
    </div>
  )
}
