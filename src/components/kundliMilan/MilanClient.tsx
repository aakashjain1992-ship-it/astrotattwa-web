'use client'

import { useState, useRef } from 'react'
import { format as formatDate } from 'date-fns'
import { CitySearch, type City } from '@/components/forms/CitySearch'
import { DateTimeField, type DateTimeValue } from '@/components/forms/DateTimeField'
import type { PersonBirthInput, MilanResult } from '@/lib/astrology/kundliMilan/types'

type Step = 'form' | 'loading'

interface PersonState {
  name: string
  gender: 'Male' | 'Female'
  dateTime: DateTimeValue
  cityDisplay: string
}

const emptyPerson = (gender: 'Male' | 'Female'): PersonState => ({
  name: '', gender, dateTime: {}, cityDisplay: '',
})

export default function MilanClient() {
  const [step, setStep] = useState<Step>('form')
  const [p1, setP1] = useState<PersonState>(emptyPerson('Male'))
  const [p2, setP2] = useState<PersonState>(emptyPerson('Female'))
  const [errors, setErrors] = useState<{ p1: Record<string, string>; p2: Record<string, string> }>({ p1: {}, p2: {} })
  const [apiError, setApiError] = useState<string | null>(null)

  const city1Ref = useRef<{ lat: number; lng: number; timezone: string; place: string } | null>(null)
  const city2Ref = useRef<{ lat: number; lng: number; timezone: string; place: string } | null>(null)

  function handleP1GenderChange(g: 'Male' | 'Female') {
    setP1(prev => ({ ...prev, gender: g }))
    setP2(prev => ({ ...prev, gender: g === 'Male' ? 'Female' : 'Male' }))
  }

  function buildInput(p: PersonState, ref: typeof city1Ref): PersonBirthInput | null {
    if (!p.name.trim() || !p.dateTime.date || !p.dateTime.hour || !p.dateTime.minute || !p.dateTime.period || !ref.current) return null
    return {
      name: p.name.trim(), gender: p.gender,
      birthDate: formatDate(p.dateTime.date, 'yyyy-MM-dd'),
      birthTime: `${p.dateTime.hour}:${p.dateTime.minute}`,
      timePeriod: p.dateTime.period,
      birthPlace: ref.current.place,
      latitude: ref.current.lat, longitude: ref.current.lng, timezone: ref.current.timezone,
    }
  }

  function validate() {
    const e1: Record<string, string> = {}
    const e2: Record<string, string> = {}
    if (!p1.name.trim()) e1.name = 'Required'
    if (!p1.dateTime.date) e1.date = 'Required'
    if (!p1.dateTime.hour || !p1.dateTime.minute || !p1.dateTime.period) e1.time = 'Required'
    if (!city1Ref.current) e1.city = 'Required'
    if (!p2.name.trim()) e2.name = 'Required'
    if (!p2.dateTime.date) e2.date = 'Required'
    if (!p2.dateTime.hour || !p2.dateTime.minute || !p2.dateTime.period) e2.time = 'Required'
    if (!city2Ref.current) e2.city = 'Required'
    setErrors({ p1: e1, p2: e2 })
    if (Object.keys(e1).length > 0 || Object.keys(e2).length > 0) return null
    const i1 = buildInput(p1, city1Ref)
    const i2 = buildInput(p2, city2Ref)
    return i1 && i2 ? { i1, i2 } : null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inputs = validate()
    if (!inputs) return
    setStep('loading')
    setApiError(null)
    try {
      const res = await fetch('/api/kundli-milan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1: inputs.i1, person2: inputs.i2 }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Calculation failed. Please try again.')
      }
      const data = await res.json()
      localStorage.setItem('milanResult', JSON.stringify({
        result: data.data,
        person1Input: inputs.i1,
        person2Input: inputs.i2,
      }))
      window.location.href = '/kundli-milan/result'
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong.')
      setStep('form')
    }
  }

  function handleReset() {
    setP1(emptyPerson('Male'))
    setP2(emptyPerson('Female'))
    city1Ref.current = null
    city2Ref.current = null
    setErrors({ p1: {}, p2: {} })
    setApiError(null); setStep('form')
  }

  if (step === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
        <p style={{ fontSize: 16, color: 'var(--text2)', margin: 0 }}>Calculating compatibility…</p>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>Matching {p1.name} & {p2.name} across 8 kutas</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .milan-form-wrapper {
          background: hsl(var(--muted)/0.45);
          border-bottom: 1px solid var(--border);
        }
        .milan-form-section {
          max-width: 1080px;
          margin: 0 auto;
          padding: 48px 32px 64px;
        }
        .milan-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .milan-panel {
          border-radius: 16px;
          border: 1px solid var(--border);
          background: hsl(var(--card));
          padding: 28px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .milan-field label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text3);
          margin-bottom: 5px;
        }
        .milan-input {
          width: 100%;
          height: 42px;
          padding: 0 13px;
          border-radius: 9px;
          border: 1px solid var(--border2);
          background: hsl(var(--background));
          color: var(--text);
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .milan-input:focus { border-color: var(--blue); }
        .milan-input.error { border-color: #ef4444; }
        .milan-gender { display: flex; gap: 6px; }
        .milan-gender button {
          flex: 1;
          height: 38px;
          border-radius: 8px;
          border: 1px solid var(--border2);
          background: hsl(var(--background));
          color: var(--text2);
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .milan-err { font-size: 11px; color: #ef4444; margin-top: 4px; }
        @media (max-width: 680px) {
          .milan-panels { grid-template-columns: 1fr; }
          .milan-form-section { padding: 32px 16px 56px; }
        }
      `}</style>

      <div className="milan-form-wrapper"><div className="milan-form-section">

        {apiError && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: 14, marginBottom: 20 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="milan-panels">

            {/* ── Your Details ── */}
            <div className="milan-panel" style={{ borderTop: '3px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</span>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6', margin: 0 }}>Your Details</p>
              </div>

              <PersonFields
                person={p1}
                errors={errors.p1}
                accent="#3b82f6"
                onNameChange={name => setP1(prev => ({ ...prev, name }))}
                onGenderChange={handleP1GenderChange}
                onDateTimeChange={dateTime => setP1(prev => ({ ...prev, dateTime }))}
                onCitySelect={(city, display) => { city1Ref.current = city; setP1(prev => ({ ...prev, cityDisplay: display })) }}
              />
            </div>

            {/* ── Partner's Details ── */}
            <div className="milan-panel" style={{ borderTop: '3px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</span>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b5cf6', margin: 0 }}>Partner&apos;s Details</p>
              </div>

              <PersonFields
                person={p2}
                errors={errors.p2}
                accent="#8b5cf6"
                onNameChange={name => setP2(prev => ({ ...prev, name }))}
                onGenderChange={g => setP2(prev => ({ ...prev, gender: g }))}
                onDateTimeChange={dateTime => setP2(prev => ({ ...prev, dateTime }))}
                onCitySelect={(city, display) => { city2Ref.current = city; setP2(prev => ({ ...prev, cityDisplay: display })) }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%',
              height: 54,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.92')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Calculate Compatibility →
          </button>
        </form>
      </div></div>
    </>
  )
}

// ── Person fields sub-component ─────────────────────────────────────────────

interface PersonFieldsProps {
  person: PersonState
  errors: Record<string, string>
  accent: string
  onNameChange: (v: string) => void
  onGenderChange: (v: 'Male' | 'Female') => void
  onDateTimeChange: (v: DateTimeValue) => void
  onCitySelect: (city: { lat: number; lng: number; timezone: string; place: string }, display: string) => void
}

function PersonFields({ person, errors, accent, onNameChange, onGenderChange, onDateTimeChange, onCitySelect }: PersonFieldsProps) {
  function handleCitySelect(city: City) {
    onCitySelect(
      { lat: city.latitude, lng: city.longitude, timezone: city.timezone, place: `${city.city_name}, ${city.state_name || city.country}` },
      `${city.city_name}, ${city.state_name || city.country}`
    )
  }

  return (
    <>
      {/* Name */}
      <div className="milan-field">
        <label>Full Name</label>
        <input
          className={`milan-input${errors.name ? ' error' : ''}`}
          value={person.name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Rahul Sharma"
        />
        {errors.name && <p className="milan-err">{errors.name}</p>}
      </div>

      {/* Gender */}
      <div className="milan-field">
        <label>Gender</label>
        <div className="milan-gender">
          {(['Male', 'Female'] as const).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => onGenderChange(g)}
              style={person.gender === g ? {
                border: `1px solid ${accent}`,
                background: accent === '#3b82f6' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                color: accent,
                fontWeight: 600,
              } : {}}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Date + Time */}
      <DateTimeField
        labelDate="Date of Birth"
        labelTime="Time of Birth"
        value={person.dateTime}
        onChange={onDateTimeChange}
        disabledFuture
        errorDate={errors.date}
        errorTime={errors.time}
      />

      {/* City */}
      <div className="milan-field">
        <label>Birth Place</label>
        <CitySearch value={person.cityDisplay} onSelect={handleCitySelect} />
        {errors.city && <p className="milan-err">{errors.city}</p>}
      </div>
    </>
  )
}
