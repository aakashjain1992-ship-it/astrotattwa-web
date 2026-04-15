'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/hooks/useAuth'
import { calculateNumerology } from '@/lib/numerology/calculate'
import { NumerologyReport } from '@/components/numerology/NumerologyReport'
import { SavedReadings } from '@/components/numerology/SavedReadings'
import { DateTimeField, type DateTimeValue } from '@/components/forms/DateTimeField'
import type { NumerologyResult, SavedNumerologyReading } from '@/types/numerology'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert JS Date to DD-MM-YYYY */
function dateToDob(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

/** Convert DD-MM-YYYY back to a JS Date (for restoring saved readings) */
function dobToDate(dob: string): Date {
  const [dd, mm, yyyy] = dob.split('-')
  return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NumerologyClient() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { user, loading: authLoading } = useAuth()

  // Form state
  const [name, setName] = useState('')
  const [dateTime, setDateTime] = useState<DateTimeValue>({})
  const [formError, setFormError] = useState('')

  // Result state
  const [result, setResult] = useState<NumerologyResult | null>(null)
  const [currentDob, setCurrentDob] = useState('')

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Saved readings
  const [savedReadings, setSavedReadings] = useState<SavedNumerologyReading[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,17,23,0.03)'

  // Load saved readings when user is authenticated
  useEffect(() => {
    if (!user) {
      setSavedReadings([])
      return
    }
    fetch('/api/numerology')
      .then((r) => r.json())
      .then((data) => {
        if (data.readings) setSavedReadings(data.readings)
      })
      .catch(() => {/* ignore */})
  }, [user])

  // Reset saved state when result changes
  useEffect(() => {
    setSaved(false)
  }, [result])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Please enter a name.')
      return
    }
    if (!dateTime.date) {
      setFormError('Please select a date of birth.')
      return
    }

    const dob = dateToDob(dateTime.date)
    const calculated = calculateNumerology(dob, trimmedName)
    setResult(calculated)
    setCurrentDob(dob)
    setSaved(false)

    // Scroll to result smoothly
    setTimeout(() => {
      document.getElementById('numerology-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [name, dateTime])

  const handleSave = useCallback(async () => {
    if (!result || !user || saving || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: result.name, dob: result.dob, result_json: result }),
      })
      if (res.ok) {
        const data = await res.json()
        setSaved(true)
        if (data.reading) {
          setSavedReadings((prev) => [data.reading, ...prev])
        }
      }
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }, [result, user, saving, saved])

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/numerology/${id}`, { method: 'DELETE' })
      setSavedReadings((prev) => prev.filter((r) => r.id !== id))
    } catch { /* ignore */ }
    finally { setDeleting(null) }
  }, [])

  const handleSelectSaved = useCallback((savedResult: NumerologyResult, savedName: string, savedDob: string) => {
    setResult(savedResult)
    setCurrentDob(savedDob)
    setName(savedName)
    setDateTime({ date: dobToDate(savedDob) })
    setSaved(true)
    setTimeout(() => {
      document.getElementById('numerology-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 80px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 0 40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--blue)',
          marginBottom: 16,
          padding: '4px 14px',
          borderRadius: 20,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
        }}>
          Lo Shu Grid System
        </div>
        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 400,
          color: 'var(--text)',
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          Numerology Reading
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Discover your life blueprint through the ancient Lo Shu Grid — planes, arrows, Raj Yogas, and karmic lessons derived from your date of birth.
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(13,17,23,0.02)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 20,
        padding: '32px',
        marginBottom: 32,
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>

            {/* Name */}
            <div style={{ flex: '1 1 240px' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${borderColor}`,
                  background: inputBg,
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Date of Birth */}
            <div style={{ flex: '1 1 220px' }}>
              <DateTimeField
                labelDate="Date of Birth"
                value={dateTime}
                onChange={setDateTime}
                dateOnly
                disabledFuture
                fromYear={1900}
              />
            </div>
          </div>

          {formError && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 16px' }}>{formError}</p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--blue)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.03em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Generate Reading →
          </button>
        </form>

        {/* Saved readings (auth-gated) */}
        {!authLoading && user && savedReadings.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${borderColor}` }}>
            <SavedReadings
              readings={savedReadings}
              onSelect={handleSelectSaved}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </div>
        )}

        {!authLoading && !user && (
          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', margin: '20px 0 0', lineHeight: 1.6 }}>
            <a href="/login" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Sign in</a> to save readings and build your numerology history.
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          id="numerology-result"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 20,
            padding: '32px',
          }}
        >
          <NumerologyReport
            result={result}
            onSave={user ? handleSave : undefined}
            saving={saving}
            saved={saved}
          />
        </div>
      )}
    </div>
  )
}
