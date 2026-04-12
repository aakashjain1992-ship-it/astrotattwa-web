import type { HoroscopeContent, HoroscopeLang } from '@/types/horoscope'

interface InsightChipsProps {
  content: HoroscopeContent
  lang:    HoroscopeLang
}

const CHIP_LABELS: Record<string, { en: string; hi: string }> = {
  lucky_colour:    { en: 'Lucky Colour',    hi: 'शुभ रंग'  },
  lucky_number:    { en: 'Lucky Number',    hi: 'शुभ अंक'  },
  favourable_time: { en: 'Favourable Time', hi: 'शुभ समय'  },
  remedy:          { en: 'Remedy',          hi: 'उपाय'      },
}

function colourToHex(text: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e',
    blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7',
    pink: '#ec4899', white: '#f8fafc', black: '#1e293b', grey: '#94a3b8',
    gray: '#94a3b8', gold: '#f59e0b', silver: '#cbd5e1', brown: '#92400e',
    cyan: '#06b6d4', teal: '#14b8a6', maroon: '#9f1239', saffron: '#f97316',
  }
  const lower = text.toLowerCase()
  for (const [key, hex] of Object.entries(map)) {
    if (lower.includes(key)) return hex
  }
  return '#94a3b8'
}

export function InsightChips({ content, lang }: InsightChipsProps) {
  const chips = [
    {
      key:   'lucky_colour',
      icon:  '🎨',
      value: content.lucky_colour,
      extra: (
        <span
          className="inline-block w-3 h-3 rounded-full flex-shrink-0 ml-1"
          style={{ backgroundColor: colourToHex(content.lucky_colour) }}
        />
      ),
    },
    { key: 'lucky_number',    icon: '🔢', value: content.lucky_number },
    { key: 'favourable_time', icon: '⏰', value: content.favourable_time },
    { key: 'remedy',          icon: '🙏', value: content.remedy },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {chips.map(chip => (
        <div
          key={chip.key}
          className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>{chip.icon}</span>
            <span>{lang === 'hi' ? CHIP_LABELS[chip.key].hi : CHIP_LABELS[chip.key].en}</span>
            {'extra' in chip && chip.extra}
          </div>
          <p className="text-sm text-foreground leading-snug">{chip.value}</p>
        </div>
      ))}
    </div>
  )
}
