'use client'

import { useState, useEffect, useRef } from 'react'

const PLANETS = [
  {
    sym: '☉', name: 'Surya', en: 'Sun', rgb: '218,160,50',
    desc: 'Surya is your soul and the source of your identity. It represents the self you show to the world — your confidence, your presence, the way you step into a room. Where the Sun sits in your chart reveals your life\'s central theme and the kind of recognition your soul is seeking.',
    points: ['Your relationship with authority figures and the father', 'Career direction and public reputation', 'Vitality, immunity, and physical strength', 'The area of life where you need to shine'],
    tags: ['Soul', 'Father', 'Authority', 'Career', 'Vitality'],
  },
  {
    sym: '☽', name: 'Chandra', en: 'Moon', rgb: '120,180,220',
    desc: 'Chandra is your mind. Not just how you think, but how you feel — the emotional undercurrent running beneath every decision you make. The Moon reveals your instincts, your relationship with your mother, and the inner world that only the people closest to you ever get to see.',
    points: ['Emotional nature and habitual reactions', 'The relationship with the mother and home', 'Sleep patterns, mental peace, and mood cycles', 'What makes you feel safe and nourished'],
    tags: ['Mind', 'Emotions', 'Mother', 'Intuition', 'Home'],
  },
  {
    sym: '♂', name: 'Mangal', en: 'Mars', rgb: '220,100,100',
    desc: 'Mangal is your fire. It is the force that makes you act, compete, and fight for what you want. Mars governs your courage in the face of obstacles and your stamina when things get hard. It also rules siblings, property, and the physical body\'s raw strength.',
    points: ['Energy levels and physical endurance', 'Courage, aggression, and competitive drive', 'Younger siblings and the quality of those bonds', 'Land, property, and real estate matters'],
    tags: ['Courage', 'Siblings', 'Property', 'Drive', 'Action'],
  },
  {
    sym: '☿', name: 'Budha', en: 'Mercury', rgb: '80,200,130',
    desc: 'Budha governs the way you communicate and process the world. It shapes your speech, your writing, your ability to learn quickly and make connections others miss. Mercury also rules commerce — the instinct for trade, negotiation, and seeing opportunity in detail.',
    points: ['Intelligence, analytical thinking, and logic', 'Speech, writing, and the ability to persuade', 'Business instincts, trading, and financial acumen', 'Skin health and the nervous system'],
    tags: ['Intellect', 'Speech', 'Trade', 'Logic', 'Learning'],
  },
  {
    sym: '♃', name: 'Guru', en: 'Jupiter', rgb: '210,175,60',
    desc: 'Guru is the great teacher and the planet of expansion. Wherever Jupiter sits, it blesses and grows — but it also calls you to wisdom over mere luck. Jupiter reveals your relationship with knowledge, with children, and with the larger purpose that gives your life meaning.',
    points: ['Access to wealth, abundance, and good fortune', 'Children, pregnancy, and parenting', 'Devotion, philosophy, and the search for meaning', 'Teachers, mentors, and the guidance you attract'],
    tags: ['Wisdom', 'Children', 'Wealth', 'Dharma', 'Expansion'],
  },
  {
    sym: '♀', name: 'Shukra', en: 'Venus', rgb: '180,140,240',
    desc: 'Shukra is the planet of beauty, pleasure, and desire. It governs what you find attractive — in a partner, in art, in the way you live. Venus reveals the quality of your romantic life, your aesthetic sense, and how deeply you are capable of experiencing pleasure.',
    points: ['Romantic partnerships and what you attract', 'Taste in art, fashion, music, and beauty', 'Luxury, comfort, and material enjoyment', 'The face, eyes, and the quality of desire itself'],
    tags: ['Love', 'Beauty', 'Art', 'Pleasure', 'Marriage'],
  },
  {
    sym: '♄', name: 'Shani', en: 'Saturn', rgb: '120,140,165',
    desc: 'Shani is the planet of karma — the slow, patient force that holds you accountable. Saturn does not punish; it teaches through consequence. Where Saturn sits, life requires sustained effort before rewards appear. These are the areas where you will grow most deeply, and ultimately, master.',
    points: ['Karmic lessons and the themes that repeat until learned', 'Career longevity built through effort and discipline', 'Relationship with older people, elders, and servants', 'The bones, teeth, joints, and the aging process'],
    tags: ['Karma', 'Discipline', 'Longevity', 'Service', 'Patience'],
  },
  {
    sym: '☊', name: 'Rahu', en: 'North Node', rgb: '80,200,160',
    desc: 'Rahu is a shadow planet — no physical body, but an intense gravitational pull on your desires. It represents what your soul is hungry for in this lifetime. Rahu amplifies whatever it touches, sometimes to obsession. Its placement shows the unfamiliar territory you\'re being pulled toward, even if it frightens you.',
    points: ['Deep cravings and the areas of life that feel magnetic', 'Unconventional paths, foreign cultures, and disruption', 'Sudden rises and reversals of fortune', 'Illusion, ambition without limit, and the hunger for more'],
    tags: ['Desire', 'Obsession', 'Foreign', 'Ambition', 'Illusion'],
  },
  {
    sym: '☋', name: 'Ketu', en: 'South Node', rgb: '230,155,85',
    desc: 'Ketu is the planet of liberation. What Rahu craves, Ketu has already mastered — in past lives. Ketu\'s placement shows your innate gifts, the abilities that come almost too naturally. But Ketu also pulls inward, toward renunciation and moksha, away from worldly attachment.',
    points: ['Natural talents carried from previous lifetimes', 'Spiritual gifts, psychic sensitivity, and inner knowing', 'Disillusionment with the material world', 'The path toward detachment, moksha, and liberation'],
    tags: ['Past life', 'Spirituality', 'Liberation', 'Detachment', 'Moksha'],
  },
]

export function NavagrahaSection() {
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          el.classList.add('vis')
          io.unobserve(el)
        }
      })
    }, { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function selectPlanet(i: number) {
    if (i === active) return
    setPrev(active)
    setActive(i)
    setTimeout(() => setPrev(null), 400)
  }

  return (
    <section style={{
      background: '#fff',
      padding: '96px 0 100px',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 64px' }}>

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '10.5px', fontWeight: 500,
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--blue)', marginBottom: '14px',
          }}>
            Navagraha — the nine planets
          </span>
          <h2 style={{
            fontFamily: "FangSong, STFangSong, fangsong, 'Palatino Linotype', Georgia, serif",
            fontSize: 'clamp(28px,3vw,42px)', 
            fontWeight: 700,
            color: 'var(--text)', lineHeight: 1.15,
          }}>
            Every planet governs<br />a part of your{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>life.</em>
          </h2>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: '4px',
          marginBottom: '48px', position: 'relative',
        }}>
          {PLANETS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => selectPlanet(i)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', padding: '12px 18px 10px',
                borderRadius: '12px', cursor: 'pointer',
                border: `1px solid ${active === i ? `rgba(${p.rgb},.25)` : 'transparent'}`,
                background: active === i ? `rgba(${p.rgb},.08)` : 'transparent',
                transition: 'background .2s, border-color .2s, transform .15s',
                minWidth: '80px', position: 'relative',
              }}
            >
              {/* Glyph circle */}
              <div style={{
                width: '44px', height: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                border: active === i ? `1.5px solid rgba(${p.rgb},.45)` : '1.5px solid rgba(15,23,42,.1)',
                background: active === i ? `rgba(${p.rgb},.08)` : 'rgba(15,23,42,.04)',
                transition: 'background .2s, border-color .2s, transform .2s, box-shadow .2s',
                transform: active === i ? 'scale(1.1)' : 'scale(1)',
                boxShadow: active === i ? `0 0 12px rgba(${p.rgb},.25), 0 0 0 3px rgba(${p.rgb},.08)` : 'none',
                fontFamily: "'Segoe UI Symbol','Apple Symbols','Symbola',serif",
                fontSize: '19px', lineHeight: 1,
                color: active === i ? `rgb(${p.rgb})` : 'rgba(15,23,42,.38)',
              }}>
                {p.sym}
              </div>

              {/* Name */}
              <span style={{
                fontSize: '9.5px', fontWeight: 600,
                letterSpacing: '1.8px', textTransform: 'uppercase',
                color: active === i ? `rgb(${p.rgb})` : 'rgba(15,23,42,.35)',
                transition: 'color .2s',
              }}>
                {p.name}
              </span>

              {/* Bottom indicator */}
              <span style={{
                position: 'absolute', bottom: '-2px', left: '20%', right: '20%',
                height: '2px', borderRadius: '2px',
                background: `rgb(${p.rgb})`,
                transform: active === i ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform .25s',
              }} />
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: '320px',
          position: 'relative',
        }}>
          {PLANETS.map((p, i) => (
            <div
              key={p.name}
              style={{
                position: i === active ? 'relative' : 'absolute',
                inset: 0,
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                opacity: i === active ? 1 : 0,
                pointerEvents: i === active ? 'auto' : 'none',
                transform: i === active ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity .35s ease, transform .35s ease',
                '--p-rgb': p.rgb,
              } as React.CSSProperties}
            >
              {/* Left panel */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `rgba(${p.rgb},.06)`,
                borderRight: `1px solid rgba(${p.rgb},.12)`,
                padding: '40px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Radial glow */}
                <div style={{
                  position: 'absolute',
                  width: '200px', height: '200px', borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(${p.rgb},.15) 0%, transparent 70%)`,
                  top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                }} />

                {/* Big glyph */}
                <div style={{
                  position: 'relative', zIndex: 1,
                  width: '150px', height: '150px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {/* Outer ring */}
                  <div style={{
                    position: 'absolute',
                    inset: '-8px', borderRadius: '50%',
                    border: `1px solid rgba(${p.rgb},.22)`,
                  }} />
                  {/* Dashed ring */}
                  <div style={{
                    position: 'absolute',
                    inset: '-20px', borderRadius: '50%',
                    border: `1px dashed rgba(${p.rgb},.1)`,
                  }} />
                  {/* Symbol */}
                  <div style={{
                    width: '108px', height: '108px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    background: `rgba(${p.rgb},.1)`,
                    border: `1.5px solid rgba(${p.rgb},.3)`,
                    boxShadow: `0 0 32px rgba(${p.rgb},.2), inset 0 0 20px rgba(${p.rgb},.06)`,
                    fontFamily: "'Segoe UI Symbol','Apple Symbols','Symbola',serif",
                    fontSize: '54px', lineHeight: 1,
                    color: `rgba(${p.rgb},.85)`,
                    filter: `drop-shadow(0 2px 12px rgba(${p.rgb},.4))`,
                    position: 'relative', zIndex: 1,
                  }}>
                    {p.sym}
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div style={{
                padding: '44px 48px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '10px', fontWeight: 600,
                  letterSpacing: '2.5px', textTransform: 'uppercase',
                  color: `rgba(${p.rgb},.7)`, marginBottom: '8px',
                }}>
                  {p.en}
                </span>
                <h3 style={{
                  fontFamily: "FangSong, STFangSong, fangsong, 'Palatino Linotype', Georgia, serif",
                  fontSize: '36px', color: 'var(--text)',
                  lineHeight: 1.1, marginBottom: '16px',
                }}>
                  {p.name}
                </h3>
                <p style={{
                  fontSize: '15px', lineHeight: 1.72,
                  color: 'var(--text2)', marginBottom: '24px',
                  maxWidth: '520px',
                }}>
                  {p.desc}
                </p>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  gap: '8px', marginBottom: '28px',
                }}>
                  {p.points.map(pt => (
                    <div key={pt} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      fontSize: '13px', color: 'var(--text2)', lineHeight: 1.55,
                    }}>
                      <span style={{
                        flexShrink: 0, marginTop: '7px',
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: `rgb(${p.rgb})`,
                      }} />
                      {pt}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {p.tags.map(tg => (
                    <span key={tg} style={{
                      fontSize: '11px', fontWeight: 500, letterSpacing: '.4px',
                      padding: '4px 12px', borderRadius: '20px',
                      color: `rgb(${p.rgb})`,
                      background: `rgba(${p.rgb},.08)`,
                      border: `1px solid rgba(${p.rgb},.18)`,
                    }}>
                      {tg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 800px) {
          .nava-pane-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
