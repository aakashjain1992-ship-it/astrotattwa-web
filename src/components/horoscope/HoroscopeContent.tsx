'use client'

import { InsightChips } from './InsightChips'
import type { HoroscopeContent as HoroscopeContentType, HoroscopeType, HoroscopeLang } from '@/types/horoscope'

type Section = 'overview' | 'career' | 'love' | 'health'

const SECTIONS: Record<HoroscopeType, { key: Section; labelEn: string; labelHi: string; icon: string }[]> = {
  daily: [
    { key: 'overview', labelEn: 'Overview',          labelHi: 'राशिफल',           icon: '✨' },
    { key: 'career',   labelEn: 'Career & Finance',  labelHi: 'करियर और वित्त',   icon: '💼' },
    { key: 'love',     labelEn: 'Love & Relations',  labelHi: 'प्रेम और संबंध',   icon: '💕' },
    { key: 'health',   labelEn: 'Health',            labelHi: 'स्वास्थ्य',         icon: '🌿' },
  ],
  weekly: [
    { key: 'overview', labelEn: "Week's Theme",      labelHi: 'सप्ताह का विषय',   icon: '🔭' },
    { key: 'career',   labelEn: 'Career Focus',      labelHi: 'करियर फोकस',       icon: '💼' },
    { key: 'love',     labelEn: 'Relationships',     labelHi: 'संबंध',             icon: '💕' },
    { key: 'health',   labelEn: 'Health Priority',   labelHi: 'स्वास्थ्य',         icon: '🌿' },
  ],
  monthly: [
    { key: 'overview', labelEn: 'Monthly Trend',     labelHi: 'मासिक रुझान',      icon: '🌙' },
    { key: 'career',   labelEn: 'Strategic Focus',   labelHi: 'करियर रणनीति',     icon: '💼' },
    { key: 'love',     labelEn: 'Relationships',     labelHi: 'संबंध',             icon: '💕' },
    { key: 'health',   labelEn: 'Wellness Pattern',  labelHi: 'स्वास्थ्य',         icon: '🌿' },
  ],
}

interface HoroscopeContentProps {
  content: HoroscopeContentType
  type:    HoroscopeType
  lang:    HoroscopeLang
}

export function HoroscopeContent({ content, type, lang }: HoroscopeContentProps) {
  const sections = SECTIONS[type]

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {sections.map(sec => (
          <div key={sec.key}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              <span>{sec.icon}</span>
              <span>{lang === 'hi' ? sec.labelHi : sec.labelEn}</span>
            </div>
            <p className="text-foreground leading-relaxed text-[15px]">
              {content[sec.key]}
            </p>
          </div>
        ))}
      </div>

      <InsightChips content={content} lang={lang} />
    </div>
  )
}
