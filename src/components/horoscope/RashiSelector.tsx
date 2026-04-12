'use client'

import { useRouter } from 'next/navigation'
import { RASHI_MAP } from '@/lib/horoscope/rashiMap'
import type { HoroscopeLang, HoroscopeType } from '@/types/horoscope'
import { cn } from '@/lib/utils'

interface RashiSelectorProps {
  currentRashi: string
  currentType: HoroscopeType
  lang: HoroscopeLang
}

export function RashiSelector({ currentRashi, currentType, lang }: RashiSelectorProps) {
  const router = useRouter()

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-2 px-4 min-w-max mx-auto md:justify-center">
        {RASHI_MAP.map(rashi => {
          const isActive = rashi.slug === currentRashi
          return (
            <button
              key={rashi.slug}
              onClick={() => router.push(`/horoscope/${currentType}/${rashi.slug}`)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all duration-200 select-none min-w-[64px]',
                isActive
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'bg-card border-border hover:border-amber-400/60 hover:bg-amber-500/5 text-muted-foreground hover:text-foreground'
              )}
              aria-label={`${rashi.nameEn} horoscope`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl leading-none">{rashi.symbol}</span>
              <span className="text-[10px] font-medium leading-tight">
                {lang === 'hi' ? rashi.nameHi : rashi.nameEn}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
