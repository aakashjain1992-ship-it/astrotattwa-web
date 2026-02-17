'use client'

import { useState } from 'react'

const PLANETS = [
  {
    sym: '☉', name: 'Surya', en: 'Sun', rgb: '218,160,50',
    desc: 'The soul, authority, and vitality. Surya governs your sense of self, your relationship with your father, and your overall life force.',
    points: ['Soul & Self', 'Father & Authority', 'Vitality', 'Career & Fame'],
    tags: ['Leo', 'Exalted in Aries', 'Debilitated in Libra'],
  },
  {
    sym: '☽', name: 'Chandra', en: 'Moon', rgb: '180,200,240',
    desc: 'Mind, emotions, and the mother. Chandra represents your inner world, emotional patterns, and instinctive responses.',
    points: ['Mind & Emotions', 'Mother', 'Intuition', 'Public image'],
    tags: ['Cancer', 'Exalted in Taurus', 'Debilitated in Scorpio'],
  },
  {
    sym: '♂', name: 'Mangala', en: 'Mars', rgb: '220,80,60',
    desc: 'Energy, courage, and action. Mangala drives ambition, physical strength, and the will to compete and conquer.',
    points: ['Energy & Drive', 'Courage', 'Siblings', 'Land & Property'],
    tags: ['Aries & Scorpio', 'Exalted in Capricorn'],
  },
  {
    sym: '☿', name: 'Budha', en: 'Mercury', rgb: '100,185,100',
    desc: 'Intelligence, communication, and commerce. Budha rules logical thinking, speech, and analytical ability.',
    points: ['Intellect', 'Communication', 'Business', 'Education'],
    tags: ['Gemini & Virgo', 'Exalted in Virgo'],
  },
  {
    sym: '♃', name: 'Guru', en: 'Jupiter', rgb: '210,170,80',
    desc: 'Wisdom, expansion, and grace. Guru is the great benefic — bringer of blessings, spiritual insight, and worldly fortune.',
    points: ['Wisdom & Knowledge', 'Wealth', 'Spirituality', 'Children'],
    tags: ['Sagittarius & Pisces', 'Exalted in Cancer'],
  },
  {
    sym: '♀', name: 'Shukra', en: 'Venus', rgb: '220,130,180',
    desc: 'Love, beauty, and pleasure. Shukra governs relationships, creativity, luxury, and the fine arts.',
    points: ['Love & Marriage', 'Arts & Beauty', 'Wealth', 'Sensual pleasures'],
    tags: ['Taurus & Libra', 'Exalted in Pisces'],
  },
  {
    sym: '♄', name: 'Shani', en: 'Saturn', rgb: '150,130,100',
    desc: 'Discipline, karma, and longevity. Shani rewards patience and hard work while teaching through limitation and delay.',
    points: ['Karma & Duty', 'Discipline', 'Longevity', 'Service'],
    tags: ['Capricorn & Aquarius', 'Exalted in Libra'],
  },
  {
    sym: '☊', name: 'Rahu', en: 'Rahu', rgb: '100,160,200',
    desc: 'Obsession, ambition, and the future. Rahu is the north lunar node — amplifying desires and pushing towards worldly achievement.',
    points: ['Desires & Obsession', 'Foreign things', 'Innovation', 'Illusion'],
    tags: ['Shadow planet', 'North Node', 'Exalted in Taurus'],
  },
  {
    sym: '☋', name: 'Ketu', en: 'Ketu', rgb: '160,120,180',
    desc: 'Liberation, spirituality, and past karma. Ketu is the south lunar node — urging detachment and pointing towards moksha.',
    points: ['Spirituality', 'Past karma', 'Liberation', 'Mysticism'],
    tags: ['Shadow planet', 'South Node', 'Exalted in Scorpio'],
  },
]

export function NavagrahaSection() {
  const [active, setActive] = useState(0)
  const planet = PLANETS[active]

  return (
    <section className="bg-[#07101F] py-16 md:py-24" id="navagraha">
      <div className="container max-w-5xl">
        {/* Header */}
        <p className="text-xs font-medium tracking-[3px] uppercase text-white/40 mb-3">
          Navagraha — the nine planets
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-normal text-white mb-3 leading-tight">
          Every planet governs<br />a part of your life.
        </h2>
        <p className="text-[15px] text-white/50 mb-10">
          Explore the role of each planet in your Vedic chart.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PLANETS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActive(i)}
              style={active === i ? {
                backgroundColor: `rgba(${p.rgb}, 0.18)`,
                borderColor: `rgba(${p.rgb}, 0.4)`,
              } : {}}
              className={[
                'flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm transition-all cursor-pointer',
                active === i
                  ? 'border-white/10 text-white'
                  : 'bg-white/[0.06] border-transparent text-white/70 hover:bg-white/10',
              ].join(' ')}
            >
              <span className="text-lg leading-none">{p.sym}</span>
              <span className="font-medium">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div
          className="grid gap-6 md:gap-8 md:grid-cols-[auto_1fr] items-start"
          style={{ '--p-rgb': planet.rgb } as React.CSSProperties}
        >
          {/* Glyph */}
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0"
            style={{ backgroundColor: `rgba(${planet.rgb}, 0.15)` }}
          >
            {planet.sym}
          </div>

          {/* Content */}
          <div>
            <p className="text-[11px] tracking-[3px] uppercase text-white/40">{planet.en}</p>
            <h3 className="font-serif text-3xl font-normal text-white mt-1 mb-3">
              {planet.name}
            </h3>
            <p className="text-[15px] leading-relaxed text-white/60 mb-4">
              {planet.desc}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {planet.points.map(pt => (
                <span
                  key={pt}
                  className="px-3 py-1 rounded-full text-[12.5px] text-white/75"
                  style={{ backgroundColor: `rgba(${planet.rgb}, 0.12)` }}
                >
                  {pt}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {planet.tags.map(tg => (
                <span
                  key={tg}
                  className="px-2.5 py-0.5 rounded bg-white/[0.07] text-[11.5px] text-white/45"
                >
                  {tg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
