'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/hooks/useAuth'
import { calculateNumerology } from '@/lib/numerology/calculate'
import { calculateCompatibility } from '@/lib/numerology/compatibility'
import { CompatibilityReport } from '@/components/numerology/CompatibilityReport'
import { DateTimeField, type DateTimeValue } from '@/components/forms/DateTimeField'
import type { CompatibilityResult, SavedCompatibilityReading } from '@/types/numerology'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToDob(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function dobToDate(dob: string): Date {
  const [dd, mm, yyyy] = dob.split('-')
  return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd))
}

function formatDobShort(dob: string) {
  const [dd, mm, yyyy] = dob.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(dd)} ${months[parseInt(mm)-1]} ${yyyy}`
}

// ─── Saved Readings List ──────────────────────────────────────────────────────

function SavedCompatibilityReadings({
  readings,
  onSelect,
  onDelete,
  deleting,
  isDark,
  borderColor,
}: {
  readings: SavedCompatibilityReading[]
  onSelect: (r: SavedCompatibilityReading) => void
  onDelete: (id: string) => void
  deleting: string | null
  isDark: boolean
  borderColor: string
}) {
  if (readings.length === 0) return null
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
        Saved Readings
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {readings.map((r) => {
          const score = r.result_json.overallScore
          const scoreColor =
            score >= 80 ? '#10b981' :
            score >= 65 ? 'var(--blue)' :
            score >= 50 ? '#f59e0b' :
            '#ef4444'
          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => onSelect(r)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.name1} + {r.name2}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
                  {formatDobShort(r.dob1)} · {formatDobShort(r.dob2)}
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor, flexShrink: 0 }}>
                {score}/100
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(r.id) }}
                disabled={deleting === r.id}
                style={{
                  fontSize: 11, color: '#ef4444',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '2px 6px',
                  opacity: deleting === r.id ? 0.5 : 0.6,
                  flexShrink: 0,
                }}
              >
                {deleting === r.id ? '…' : '✕'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompatibilityClient() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { user, loading: authLoading } = useAuth()

  // Person 1
  const [name1, setName1] = useState('')
  const [dateTime1, setDateTime1] = useState<DateTimeValue>({})

  // Person 2
  const [name2, setName2] = useState('')
  const [dateTime2, setDateTime2] = useState<DateTimeValue>({})

  const [formError, setFormError] = useState('')
  const [result, setResult] = useState<CompatibilityResult | null>(null)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Saved readings
  const [savedReadings, setSavedReadings] = useState<SavedCompatibilityReading[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,17,23,0.12)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(13,17,23,0.03)'

  // Load saved readings
  useEffect(() => {
    if (!user) { setSavedReadings([]); return }
    fetch('/api/numerology/compatibility')
      .then((r) => r.json())
      .then((d) => { if (d.readings) setSavedReadings(d.readings) })
      .catch(() => {/* ignore */})
  }, [user])

  // Reset saved when result changes
  useEffect(() => { setSaved(false) }, [result])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const n1 = name1.trim()
    const n2 = name2.trim()
    if (!n1) { setFormError('Please enter a name for Person 1.'); return }
    if (!n2) { setFormError('Please enter a name for Person 2.'); return }
    if (!dateTime1.date) { setFormError('Please select a date of birth for Person 1.'); return }
    if (!dateTime2.date) { setFormError('Please select a date of birth for Person 2.'); return }

    const dob1 = dateToDob(dateTime1.date)
    const dob2 = dateToDob(dateTime2.date)

    const r1 = calculateNumerology(dob1, n1)
    const r2 = calculateNumerology(dob2, n2)
    const compat = calculateCompatibility(r1, r2)

    setResult(compat)
    setSaved(false)

    setTimeout(() => {
      document.getElementById('compat-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [name1, name2, dateTime1, dateTime2])

  const handleSave = useCallback(async () => {
    if (!result || !user || saving || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/numerology/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name1: result.person1.name,
          dob1: result.person1.dob,
          name2: result.person2.name,
          dob2: result.person2.dob,
          result_json: result,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSaved(true)
        if (data.reading) setSavedReadings((prev) => [data.reading, ...prev])
      }
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }, [result, user, saving, saved])

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/numerology/compatibility/${id}`, { method: 'DELETE' })
      setSavedReadings((prev) => prev.filter((r) => r.id !== id))
    } catch { /* ignore */ }
    finally { setDeleting(null) }
  }, [])

  const handleSelectSaved = useCallback((r: SavedCompatibilityReading) => {
    setResult(r.result_json)
    setName1(r.name1)
    setName2(r.name2)
    setDateTime1({ date: dobToDate(r.dob1) })
    setDateTime2({ date: dobToDate(r.dob2) })
    setSaved(true)
    setTimeout(() => {
      document.getElementById('compat-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1.5px solid ${borderColor}`,
    background: inputBg,
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text3)',
    marginBottom: 8,
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 80px' }}>

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
          color: 'hsl(280,70%,55%)',
          marginBottom: 16,
          padding: '4px 14px',
          borderRadius: 20,
          background: 'rgba(140,70,220,0.1)',
          border: '1px solid rgba(140,70,220,0.3)',
        }}>
          Lo Shu Compatibility
        </div>
        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 400,
          color: 'var(--text)',
          margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          Partner Compatibility
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Compare two Lo Shu Grids to reveal life path harmony, complementary energies, shared strengths, and growth areas — a numerological lens on compatibility.
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

          {/* Two-person form side by side */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20 }}>

            {/* Person 1 */}
            <div style={{
              flex: 1,
              minWidth: 260,
              padding: '20px',
              border: '1.5px solid rgba(59,130,246,0.25)',
              borderRadius: 14,
              background: 'rgba(59,130,246,0.03)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', margin: '0 0 16px' }}>
                Person 1
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <DateTimeField
                    labelDate="Date of Birth"
                    value={dateTime1}
                    onChange={setDateTime1}
                    dateOnly
                    disabledFuture
                    fromYear={1900}
                  />
                </div>
              </div>
            </div>

            {/* Heart divider on large screens */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--text3)', flexShrink: 0 }}>
              ♥
            </div>

            {/* Person 2 */}
            <div style={{
              flex: 1,
              minWidth: 260,
              padding: '20px',
              border: '1.5px solid rgba(140,70,220,0.25)',
              borderRadius: 14,
              background: 'rgba(140,70,220,0.03)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(280,70%,55%)', margin: '0 0 16px' }}>
                Person 2
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <DateTimeField
                    labelDate="Date of Birth"
                    value={dateTime2}
                    onChange={setDateTime2}
                    dateOnly
                    disabledFuture
                    fromYear={1900}
                  />
                </div>
              </div>
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
              background: 'linear-gradient(135deg, var(--blue), hsl(280,70%,55%))',
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
            Calculate Compatibility →
          </button>
        </form>

        {/* Saved readings */}
        {!authLoading && user && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${borderColor}` }}>
            <SavedCompatibilityReadings
              readings={savedReadings}
              onSelect={handleSelectSaved}
              onDelete={handleDelete}
              deleting={deleting}
              isDark={isDark}
              borderColor={borderColor}
            />
          </div>
        )}

        {!authLoading && !user && (
          <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', margin: '20px 0 0', lineHeight: 1.6 }}>
            <a href="/login" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Sign in</a> to save compatibility readings.
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          id="compat-result"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 20,
            padding: '32px',
          }}
        >
          <CompatibilityReport
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
