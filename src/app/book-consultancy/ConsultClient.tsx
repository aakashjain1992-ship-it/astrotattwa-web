'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, Heart, TrendingUp, Leaf,
  FileText, ScanSearch, Mail,
  BadgeCheck, Clock, Lightbulb, Globe, Tag,
  ChevronDown, Plus, X, Star, Phone, User,
} from 'lucide-react'
import { CitySearch } from '@/components/forms/CitySearch'
import type { City } from '@/components/forms/CitySearch'
import { DateTimeField } from '@/components/forms/DateTimeField'
import type { DateTimeValue } from '@/components/forms/DateTimeField'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── DATA ─────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: 'Raghav',  text: 'Maza aa gaya bhaiii, confusion clear ho gayi. Ab confidence aa gaya hai.' },
  { name: 'Neelem',  text: "I didn't expect such a detailed answer for ₹999. This is better than most in-person consultations." },
  { name: 'Lakshmi', text: 'Future plans ke liye jo answer mila, ussey mujhe direction mil gayi.' },
  { name: 'Nithya',  text: 'Asked about my business, and now I know exactly where to focus.' },
  { name: 'Kavya',   text: 'Got clarity on my personal life. Feeling more balanced now.' },
  { name: 'Rishi',   text: 'The answer on my love life helped me make better choices.' },
  { name: 'Nikita',  text: "My finances had me stressed, but the astrologer's take gave me fresh perspective." },
  { name: 'Ishita',  text: "I was lost about whether to quit my job. The answer I got helped me make the right choice, and I haven't looked back." },
]

const DOMAINS = [
  {
    Icon: Briefcase,
    title: 'Career',
    color: '#2563EB',
    bg: '#EFF6FF',
    questions: [
      'Why does success always feel slow or just out of reach?',
      'Should you keep going, switch paths, or try something new?',
      'What kind of work will truly fulfill you and bring stability?',
    ],
  },
  {
    Icon: Heart,
    title: 'Love & Relationships',
    color: '#E11D48',
    bg: '#FFF1F2',
    questions: [
      'Why do your relationships feel confusing, heavy, or stuck in a loop?',
      'Is your current partner the right one or just a passing phase?',
      "What's really causing delays or issues in your love life or marriage?",
    ],
  },
  {
    Icon: TrendingUp,
    title: 'Money & Growth',
    color: '#059669',
    bg: '#ECFDF5',
    questions: [
      'Why does money come in but never seem to stay?',
      'Are you meant to struggle, or is something blocking your growth?',
      'What changes can help you build real financial stability?',
    ],
  },
  {
    Icon: Leaf,
    title: 'Health & Inner Peace',
    color: '#7C3AED',
    bg: '#F5F3FF',
    questions: [
      'Why do you keep facing the same health or energy issues?',
      'Is stress or something deeper affecting your well-being?',
      "What's the best time and way to start healing, inside and out?",
    ],
  },
]

const WRITTEN_PACKAGES = [
  {
    id: 'q1',
    title: 'One Question',
    description: "Whether it's about love, career, or a life choice — get a personalized response from our expert astrologer.",
    originalPrice: 1199,
    price: 699,
    maxQuestions: 1,
    popular: false,
    isCall: false,
  },
  {
    id: 'q2',
    title: 'Two Questions',
    description: "Perfect if you're dealing with more than one concern. Ask 2 personal questions and get direct, customized answers.",
    originalPrice: 1699,
    price: 999,
    maxQuestions: 2,
    popular: true,
    isCall: false,
  },
  {
    id: 'q3',
    title: 'Three Questions',
    description: "When life feels overwhelming, get insights on all key areas at once. Ask up to 3 questions — clarity on everything that matters.",
    originalPrice: 2299,
    price: 1699,
    maxQuestions: 3,
    popular: false,
    isCall: false,
  },
]

const CALL_PACKAGES = [
  {
    id: 'call30',
    title: '30 Min Live Session',
    description: "A focused 30-minute call with our Vedic astrologer — ideal for one specific area you need clarity on.",
    originalPrice: null,
    price: 999,
    maxQuestions: 1,
    popular: false,
    isCall: true,
    Icon: Phone,
  },
  {
    id: 'call60',
    title: '1 Hour Detailed Session',
    description: "A comprehensive 1-hour session covering multiple life areas in depth with thorough birth chart analysis.",
    originalPrice: null,
    price: 2100,
    maxQuestions: 3,
    popular: true,
    isCall: true,
    Icon: Phone,
  },
]

const ALL_PACKAGES = [...WRITTEN_PACKAGES, ...CALL_PACKAGES]

const HOW_IT_WORKS = [
  {
    Icon: FileText,
    step: '01',
    title: 'Submit Your Question',
    description: "Fill out a short form and clearly state what's on your mind. The more specific you are, the better your answer.",
  },
  {
    Icon: ScanSearch,
    step: '02',
    title: 'Expert Analysis',
    description: "Our Vedic astrologer will analyze your query using your birth chart and current planetary positions.",
  },
  {
    Icon: Mail,
    step: '03',
    title: 'Personal Reply in 48 hrs*',
    description: "You'll receive a well-written, focused answer via email — in English or Hindi, your choice.",
  },
]

const WHY_US = [
  { Icon: BadgeCheck, label: 'Trusted Vedic Astrology System' },
  { Icon: Clock,      label: 'Delivered Within 48 Hours' },
  { Icon: Lightbulb,  label: 'Clear, Actionable Advice' },
  { Icon: Globe,      label: 'Answer in English or Hindi' },
  { Icon: Tag,        label: 'Transparent Pricing — No Hidden Fees' },
]

const FAQ_ITEMS = [
  {
    q: 'How detailed will the answer be?',
    a: 'Your answer will be a thorough written analysis based on your birth chart — typically 400–600 words covering the specific area you asked about, with clear, practical guidance.',
  },
  {
    q: 'Can I ask multiple questions in one submission?',
    a: 'Yes — our packages allow 1, 2, or 3 written questions. Each receives a dedicated, personalised answer.',
  },
  {
    q: 'How soon will I get my answer?',
    a: 'You will receive your personalised response within 48 hours of submitting your form and completing payment.',
  },
  {
    q: "What if I don't know my exact birth time?",
    a: "Please mention this in the form — our astrologer will note it and work with the best available data, letting you know where precision may vary.",
  },
  {
    q: 'How will I receive my answer?',
    a: 'Your answer will be delivered via email, written clearly in English or Hindi based on your preference.',
  },
  {
    q: 'Will my question and details remain confidential?',
    a: 'Absolutely. All submissions are treated with complete confidentiality. Your personal details are never shared with anyone.',
  },
  {
    q: 'Can I ask follow-up questions after I get my answer?',
    a: 'Follow-up questions can be submitted as a new booking. This ensures every question gets the full attention it deserves.',
  },
]

// ── HELPERS ───────────────────────────────────────────────────────────────────

function scrollToForm(packageId?: string) {
  if (packageId) {
    // store in sessionStorage so ConsultClient can pick it up
    sessionStorage.setItem('selectedPackage', packageId)
  }
  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  '#2563EB', '#E11D48', '#059669', '#7C3AED', '#D97706', '#0891B2', '#DC2626', '#0D9488',
]

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function TestimonialCard({ name, text }: { name: string; text: string }) {
  const color = avatarColor(name)
  return (
    <div style={{
      flexShrink: 0,
      width: '280px',
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
        ))}
      </div>
      <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text2)', marginBottom: '14px' }}>
        "{text}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{getInitials(name)}</span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text1)' }}>{name}</span>
      </div>
    </div>
  )
}

type PkgType = typeof ALL_PACKAGES[number]

function PricingCard({ pkg, onBook }: { pkg: PkgType; onBook: () => void }) {
  return (
    <div style={{
      position: 'relative',
      background: pkg.popular ? 'var(--blue)' : '#fff',
      border: pkg.popular ? 'none' : '1px solid var(--border)',
      borderRadius: '20px',
      padding: '28px 24px 24px',
      boxShadow: pkg.popular ? '0 8px 32px rgba(37,99,235,.25)' : 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
    }}>
      {pkg.popular && (
        <div style={{
          position: 'absolute', top: '-12px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#F59E0B', color: '#fff',
          fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
          textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px',
          whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}

      {'Icon' in pkg && pkg.isCall && (
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: pkg.popular ? 'rgba(255,255,255,.15)' : 'var(--blue-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '14px',
        }}>
          <Phone size={20} color={pkg.popular ? '#fff' : 'var(--blue)'} />
        </div>
      )}

      <h3 style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: '20px', fontWeight: 400,
        color: pkg.popular ? '#fff' : 'var(--text)',
        marginBottom: '6px',
      }}>
        {pkg.title}
      </h3>

      <p style={{
        fontSize: '13px', lineHeight: 1.6,
        color: pkg.popular ? 'rgba(255,255,255,.75)' : 'var(--text3)',
        marginBottom: '20px', flex: 1,
      }}>
        {pkg.description}
      </p>

      {/* Price */}
      <div style={{ marginBottom: '20px' }}>
        {pkg.originalPrice && (
          <span style={{
            fontSize: '14px',
            color: pkg.popular ? 'rgba(255,255,255,.55)' : 'var(--text3)',
            textDecoration: 'line-through',
            marginRight: '8px',
          }}>
            ₹{pkg.originalPrice.toLocaleString('en-IN')}
          </span>
        )}
        <span style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '32px', fontWeight: 400,
          color: pkg.popular ? '#fff' : 'var(--blue)',
        }}>
          ₹{pkg.price.toLocaleString('en-IN')}
        </span>
        <span style={{
          fontSize: '13px',
          color: pkg.popular ? 'rgba(255,255,255,.6)' : 'var(--text3)',
          marginLeft: '4px',
        }}>
          {'isCall' in pkg && pkg.isCall ? `/ ${pkg.id === 'call30' ? '30 min' : '1 hr'}` : '/ consultation'}
        </span>
      </div>

      <button
        onClick={onBook}
        style={{
          width: '100%', padding: '12px',
          background: pkg.popular ? '#fff' : 'var(--blue)',
          color: pkg.popular ? 'var(--blue)' : '#fff',
          border: 'none', borderRadius: '10px',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          letterSpacing: '.2px',
          transition: 'opacity .18s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Book Now →
      </button>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

export default function ConsultClient() {
  const [selectedPkgId, setSelectedPkgId] = useState('q2')
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Form state
  const [name, setName]           = useState('')
  const [gender, setGender]       = useState('')
  const [email, setEmail]         = useState('')
  const [dateTime, setDateTime]   = useState<DateTimeValue>({})
  const [cityDisplay, setCityDisplay] = useState('')
  const [cityCoords, setCityCoords]   = useState<{ lat: number; lng: number; timezone: string } | null>(null)
  const [background, setBackground]   = useState('')
  const [questions, setQuestions]     = useState<string[]>(['', ''])
  const [lang, setLang]           = useState('English')
  const [terms, setTerms]         = useState(false)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  const pkg = ALL_PACKAGES.find(p => p.id === selectedPkgId) ?? WRITTEN_PACKAGES[1]
  const maxQ = pkg.maxQuestions

  const handleBookNow = (pkgId: string) => {
    const newPkg = ALL_PACKAGES.find(p => p.id === pkgId)!
    setSelectedPkgId(pkgId)
    setQuestions(prev => {
      const trimmed = prev.slice(0, newPkg.maxQuestions)
      return trimmed.length === 0 ? [''] : trimmed
    })
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCitySelect = (city: City) => {
    setCityDisplay(`${city.city_name}, ${city.state_name}`)
    setCityCoords({ lat: city.latitude, lng: city.longitude, timezone: city.timezone })
    if (errors.city) setErrors(prev => { const e = { ...prev }; delete e.city; return e })
  }

  const addQuestion = () => {
    if (questions.length < maxQ) setQuestions(prev => [...prev, ''])
  }

  const removeQuestion = (idx: number) => {
    if (questions.length > 1) setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, val: string) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? val : q)))
  }

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!name.trim())                                               e.name       = 'Name is required'
    if (!gender)                                                    e.gender     = 'Please select your gender'
    if (!email.trim())                                              e.email      = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))    e.email      = 'Please enter a valid email address'
    if (!dateTime.date)                                             e.dob        = 'Date of birth is required'
    if (!dateTime.hour || !dateTime.minute || !dateTime.period)     e.tob        = 'Time of birth is required'
    if (!cityDisplay.trim() || !cityCoords)                         e.city       = 'Please select your birth city'
    if (questions.some(q => !q.trim()))                             e.questions  = 'Please fill in all question fields'
    if (!terms)                                                     e.terms      = 'Please accept the Terms and Privacy Policy to continue'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) setSubmitted(true)
  }

  // ── SECTION: HERO ──────────────────────────────────────────────────────────
  const Hero = (
    <section style={{
      background: 'var(--bg-subtle)',
      padding: '80px 24px 72px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 500, letterSpacing: '2.8px',
          textTransform: 'uppercase', color: 'var(--blue)',
          marginBottom: '20px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
          Vedic Astrology Consultation
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(30px, 5vw, 52px)',
          fontWeight: 400, lineHeight: 1.12,
          color: 'var(--text)', marginBottom: '16px', letterSpacing: '-0.5px',
        }}>
          One Clear Answer —{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--blue)' }}>From a Real Astrologer</span>
        </h1>

        <p style={{
          fontSize: '16px', lineHeight: 1.75,
          color: 'var(--text2)', maxWidth: '540px',
          margin: '0 auto 12px',
        }}>
          Have a burning question about love, career, health, or marriage? Ask it now and
          get a personalised, expert answer based on your birth chart — delivered in just 48 hours*.
        </p>

        {/* Price highlight */}
        <p style={{
          fontSize: '15px', color: 'var(--text3)',
          marginBottom: '32px',
        }}>
          Starting from{' '}
          <strong style={{ color: 'var(--blue)', fontSize: '18px' }}>₹699</strong>
        </p>

        <button
          onClick={() => handleBookNow(selectedPkgId)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px',
            background: 'var(--blue)', color: '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37,99,235,.3)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,.38)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,.3)' }}
        >
          Ask Your Question Now →
        </button>
      </div>
    </section>
  )

  // ── SECTION: DOMAINS ───────────────────────────────────────────────────────
  const Domains = (
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 400, color: 'var(--text)',
            marginBottom: '10px', letterSpacing: '-0.3px',
          }}>
            Let's Get to the Root of{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--blue)' }}>What's Holding You Back</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text3)' }}>
            Pinpoint the blocks in your life — get clarity on career, relationships, and money
          </p>
        </div>

        <div className="domains-grid">
          {DOMAINS.map(({ Icon, title, color, bg, questions }) => (
            <div key={title} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '28px 24px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow .2s, transform .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px',
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '19px', fontWeight: 400,
                color: 'var(--text)', marginBottom: '14px',
              }}>
                {title}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions.map(q => (
                  <li key={q} style={{ display: 'flex', gap: '8px', fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text2)' }}>
                    <span style={{ color, flexShrink: 0, marginTop: '1px' }}>◆</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: TESTIMONIALS MARQUEE ──────────────────────────────────────────
  const Marquee = (
    <section style={{ padding: '72px 0', background: 'var(--bg-subtle)', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 24px' }}>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(22px, 3vw, 34px)',
          fontWeight: 400, color: 'var(--text)',
          marginBottom: '8px',
        }}>
          Our Happy Clients
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text3)' }}>Real questions. Real answers. Real clarity.</p>
      </div>

      {/* Row 1 — scroll left */}
      <div style={{ overflow: 'hidden', marginBottom: '14px' }}>
        <div className="marquee-row-left" style={{ display: 'flex', gap: '14px', width: 'max-content' }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={i} name={t.name} text={t.text} />
          ))}
        </div>
      </div>

      {/* Row 2 — scroll right */}
      <div style={{ overflow: 'hidden' }}>
        <div className="marquee-row-right" style={{ display: 'flex', gap: '14px', width: 'max-content' }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={i} name={t.name} text={t.text} />
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: PRICING ───────────────────────────────────────────────────────
  const Pricing = (
    <section id="pricing-section" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 400, color: 'var(--text)',
            marginBottom: '10px',
          }}>
            Choose Your Package
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text3)' }}>
            Starting from <strong style={{ color: 'var(--blue)' }}>₹699</strong> — transparent pricing, no hidden charges
          </p>
        </div>

        {/* Written packages */}
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '20px' }}>
          Written Consultation
        </p>
        <div className="pricing-grid" style={{ marginBottom: '48px' }}>
          {WRITTEN_PACKAGES.map(p => (
            <PricingCard key={p.id} pkg={p} onBook={() => handleBookNow(p.id)} />
          ))}
        </div>

        {/* Call packages */}
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '20px' }}>
          Live Sessions
        </p>
        <div className="pricing-grid-2">
          {CALL_PACKAGES.map(p => (
            <PricingCard key={p.id} pkg={p} onBook={() => handleBookNow(p.id)} />
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: HOW IT WORKS ──────────────────────────────────────────────────
  const HowItWorks = (
    <section style={{ padding: '80px 24px', background: 'var(--bg-subtle)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 400, color: 'var(--text)', marginBottom: '10px',
          }}>
            How It Works
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text3)' }}>Three simple steps to get your answer</p>
        </div>

        <div className="how-grid">
          {HOW_IT_WORKS.map(({ Icon, step, title, description }, idx) => (
            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              {/* Connector line */}
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="connector-line" />
              )}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#fff', border: '2px solid var(--blue-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '18px', position: 'relative', zIndex: 1,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <Icon size={26} color="var(--blue)" />
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
                textTransform: 'uppercase', color: 'var(--blue)',
                marginBottom: '6px',
              }}>
                Step {step}
              </span>
              <h3 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '18px', fontWeight: 400,
                color: 'var(--text)', marginBottom: '10px',
              }}>
                {title}
              </h3>
              <p style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--text2)', maxWidth: '240px' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: WHY US ────────────────────────────────────────────────────────
  const WhyUs = (
    <section style={{ padding: '72px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 400, color: 'var(--text)', marginBottom: '10px',
          }}>
            Why Choose Astrotattwa
          </h2>
        </div>
        <div className="why-grid">
          {WHY_US.map(({ Icon, label }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '18px 20px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'var(--blue-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={18} color="var(--blue)" />
              </div>
              <div>
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--text2)', letterSpacing: '.1px',
                }}>
                  <span style={{
                    display: 'inline-block', width: '18px', height: '18px',
                    borderRadius: '50%', background: 'var(--blue)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    textAlign: 'center', lineHeight: '18px',
                    marginRight: '8px', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: CTA BANNER ────────────────────────────────────────────────────
  const CtaBanner = (
    <section style={{
      padding: '64px 24px',
      background: 'var(--blue)',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '11px', fontWeight: 500, letterSpacing: '2.8px',
        textTransform: 'uppercase', color: 'rgba(255,255,255,.65)',
        marginBottom: '14px',
      }}>
        Starting from ₹699 only
      </p>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 'clamp(24px, 4vw, 40px)',
        fontWeight: 400, color: '#fff',
        marginBottom: '12px', letterSpacing: '-0.3px',
      }}>
        Ready for Clarity?{' '}
        <span style={{ fontStyle: 'italic' }}>Ask Your Question Now</span>
      </h2>
      <p style={{
        fontSize: '15px', color: 'rgba(255,255,255,.75)',
        marginBottom: '32px', maxWidth: '460px', margin: '0 auto 32px',
      }}>
        Personalised answer based on your birth chart — delivered in 48 hours.
      </p>
      <button
        onClick={() => handleBookNow(selectedPkgId)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 32px',
          background: '#fff', color: 'var(--blue)',
          border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          transition: 'transform .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        Book a Consultation — from ₹699 →
      </button>
    </section>
  )

  // ── SECTION: FAQ ───────────────────────────────────────────────────────────
  const Faq = (
    <section style={{ padding: '80px 24px', background: 'var(--bg-subtle)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 38px)',
            fontWeight: 400, color: 'var(--text)', marginBottom: '10px',
          }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_ITEMS.map(({ q, a }, idx) => (
            <div key={idx} style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '16px',
                  padding: '18px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                  {q}
                </span>
                <ChevronDown
                  size={18}
                  color="var(--text3)"
                  style={{
                    flexShrink: 0,
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .2s',
                  }}
                />
              </button>
              {openFaq === idx && (
                <div style={{
                  padding: '0 20px 18px',
                  fontSize: '14px', lineHeight: 1.7,
                  color: 'var(--text2)',
                }}>
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // ── SECTION: BOOKING FORM ──────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px', fontSize: '14px',
    color: 'var(--text)', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px',
    fontWeight: 600, color: 'var(--text2)',
    marginBottom: '6px',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '12px', color: 'var(--error)',
    marginTop: '4px',
  }

  const Form = submitted ? (
    /* ── SUCCESS STATE ── */
    <section id="booking-form" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{
        maxWidth: '520px', margin: '0 auto', textAlign: 'center',
        padding: '56px 40px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--blue-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <BadgeCheck size={32} color="var(--blue)" />
        </div>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '30px', fontWeight: 400,
          color: 'var(--text)', marginBottom: '14px',
        }}>
          Booking Received!
        </h2>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text2)', marginBottom: '28px' }}>
          Thank you, <strong>{name}</strong>. We'll contact you within 24 hours to
          confirm your slot and share payment details for your{' '}
          <strong>{pkg.title}</strong> (₹{pkg.price.toLocaleString('en-IN')}).
        </p>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '14px', color: 'var(--blue)', fontWeight: 600,
          textDecoration: 'none',
        }}>
          ← Back to Home
        </Link>
      </div>
    </section>
  ) : (
    /* ── FORM ── */
    <section id="booking-form" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 400, color: 'var(--text)', marginBottom: '10px',
          }}>
            Fill Your Details & Book
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>
            All fields marked * are required
          </p>
        </div>

        {/* Package selector */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '32px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '12px' }}>
            Selected Package
          </p>
          <div className="pkg-selector">
            {ALL_PACKAGES.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPkgId(p.id)
                  setQuestions(prev => {
                    const trimmed = prev.slice(0, p.maxQuestions)
                    return trimmed.length === 0 ? [''] : trimmed
                  })
                }}
                style={{
                  padding: '8px 14px',
                  background: selectedPkgId === p.id ? 'var(--blue)' : '#fff',
                  color: selectedPkgId === p.id ? '#fff' : 'var(--text2)',
                  border: selectedPkgId === p.id ? 'none' : '1px solid var(--border)',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all .15s',
                }}
              >
                {p.title}
                <span style={{
                  marginLeft: '6px', fontWeight: 700,
                  color: selectedPkgId === p.id ? 'rgba(255,255,255,.8)' : 'var(--blue)',
                }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Gender */}
          <div className="form-row-2" style={{ marginBottom: '20px', alignItems: 'start' }}>
            <div className="space-y-2">
              <Label htmlFor="consult-name" className="flex items-center gap-2" style={{ minHeight: '20px' }}>
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="consult-name"
                placeholder=""
                autoComplete="given-name"
                value={name}
                onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => { const x = { ...prev }; delete x.name; return x }) }}
                className={errors.name ? 'border-red-400 focus-visible:ring-red-300' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2" style={{ minHeight: '20px' }}>Gender</Label>
              <Select
                value={gender}
                onValueChange={val => { setGender(val); if (errors.gender) setErrors(prev => { const x = { ...prev }; delete x.gender; return x }) }}
              >
                <SelectTrigger className={errors.gender ? 'border-red-400 focus-visible:ring-red-300' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2" style={{ marginBottom: '20px' }}>
            <Label htmlFor="consult-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="consult-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => { const x = { ...prev }; delete x.email; return x }) }}
              className={errors.email ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.email
              ? <p className="text-sm text-destructive">{errors.email}</p>
              : <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>We'll send your answer to this address</p>
            }
          </div>

          {/* DOB + TOB — same calendar/time picker as the homepage form */}
          <div style={{ marginBottom: '20px' }}>
            <DateTimeField
              value={dateTime}
              onChange={next => {
                setDateTime(next)
                if (next.date && errors.dob)  setErrors(prev => { const x = { ...prev }; delete x.dob; return x })
                if (next.hour && next.minute && next.period && errors.tob)
                  setErrors(prev => { const x = { ...prev }; delete x.tob; return x })
              }}
              errorDate={errors.dob}
              errorTime={errors.tob}
            />
          </div>

          {/* Birth Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Birth Location *</label>
            <CitySearch value={cityDisplay} onSelect={handleCitySelect} />
            {errors.city && <p style={errorStyle}>{errors.city}</p>}
          </div>

          {/* Background */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Background / Context <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional)</span></label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Any background that would help the astrologer understand your situation better..."
              value={background}
              onChange={e => setBackground(e.target.value)}
            />
          </div>

          {/* Questions */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                {pkg.isCall ? 'Topics to Discuss' : 'Your Questions'} *
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {questions.length} / {maxQ}
              </span>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} style={{ position: 'relative', marginBottom: '10px' }}>
                <textarea
                  rows={2}
                  style={{
                    ...inputStyle,
                    paddingRight: questions.length > 1 ? '40px' : '14px',
                    borderColor: errors.questions && !q.trim() ? 'var(--error)' : 'var(--border)',
                    resize: 'vertical',
                  }}
                  placeholder={
                    pkg.isCall
                      ? `Topic ${idx + 1}: What would you like to discuss?`
                      : `Question ${idx + 1}: Be specific for the best answer`
                  }
                  value={q}
                  onChange={e => updateQuestion(idx, e.target.value)}
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text3)', padding: '2px',
                    }}
                    title="Remove question"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
            {errors.questions && <p style={errorStyle}>{errors.questions}</p>}

            {questions.length < maxQ && (
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  background: 'none',
                  border: '1px dashed var(--border2)',
                  borderRadius: '8px',
                  fontSize: '13px', color: 'var(--text3)', cursor: 'pointer',
                  marginTop: '4px',
                  transition: 'border-color .15s, color .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)' }}
              >
                <Plus size={14} /> Add another question
              </button>
            )}
          </div>

          {/* Language preference */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Preferred Language for Answer</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['English', 'Hindi'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  style={{
                    padding: '8px 20px',
                    background: lang === l ? 'var(--blue)' : '#fff',
                    color: lang === l ? '#fff' : 'var(--text2)',
                    border: lang === l ? 'none' : '1px solid var(--border)',
                    borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 500,
                    transition: 'all .15s',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              cursor: 'pointer', userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={terms}
                onChange={e => { setTerms(e.target.checked); if (errors.terms) setErrors(prev => { const x = { ...prev }; delete x.terms; return x }) }}
                style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--blue)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text2)' }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && <p style={{ ...errorStyle, marginTop: '6px' }}>{errors.terms}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '15px',
              background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '.2px',
              boxShadow: '0 4px 14px rgba(37,99,235,.3)',
              transition: 'opacity .15s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.92'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Pay Now · ₹{pkg.price.toLocaleString('en-IN')} →
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text3)', marginTop: '12px' }}>
            * Answers delivered within 48 hours · No hidden charges
          </p>
        </form>
      </div>
    </section>
  )

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ paddingTop: '64px' }}>
        {Hero}
        {Marquee}
        {Pricing}
        {HowItWorks}
        {WhyUs}
        {CtaBanner}
        {Faq}
        {Form}
      </div>

      <style>{`
        /* Marquee animations */
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .marquee-row-left  { animation: marquee-left  38s linear infinite; }
        .marquee-row-right { animation: marquee-right 38s linear infinite; }
        .marquee-row-left:hover,
        .marquee-row-right:hover { animation-play-state: paused; }

        /* Domain cards grid */
        .domains-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* Pricing grids */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .pricing-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 720px;
        }

        /* How it works */
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          position: relative;
        }
        .connector-line {
          position: absolute;
          top: 32px;
          right: -50%;
          width: 100%;
          height: 1px;
          background: var(--blue-mid);
          z-index: 0;
        }

        /* Why us grid */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* Package selector in form */
        .pkg-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Form two-column row */
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .domains-grid    { grid-template-columns: repeat(2, 1fr); }
          .pricing-grid    { grid-template-columns: repeat(2, 1fr); }
          .pricing-grid-2  { grid-template-columns: repeat(2, 1fr); max-width: 100%; }
        }

        @media (max-width: 680px) {
          .domains-grid    { grid-template-columns: 1fr; }
          .pricing-grid    { grid-template-columns: 1fr; }
          .pricing-grid-2  { grid-template-columns: 1fr; }
          .how-grid        { grid-template-columns: 1fr; gap: 40px; }
          .why-grid        { grid-template-columns: 1fr; }
          .form-row-2      { grid-template-columns: 1fr; }
          .connector-line  { display: none; }
        }
      `}</style>
    </>
  )
}
