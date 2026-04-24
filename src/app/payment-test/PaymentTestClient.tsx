'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type PaymentStatus = {
  state: string
  amount: number
  merchantOrderId?: string
  orderId?: string
  errorCode?: string | null
  detailedErrorCode?: string | null
}

const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: 'Payment Successful', color: '#16a34a', bg: '#f0fdf4' },
  FAILED:    { label: 'Payment Failed',     color: '#dc2626', bg: '#fef2f2' },
  PENDING:   { label: 'Payment Pending',    color: '#d97706', bg: '#fffbeb' },
}

export default function PaymentTestClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [status, setStatus] = useState<PaymentStatus | null>(null)

  // On load, if orderId is in URL — fetch status automatically
  useEffect(() => {
    if (!orderId) return
    setStatusLoading(true)
    fetch(`/api/payment/status?orderId=${orderId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStatus(data.data)
        else setError(data.error?.message ?? 'Failed to fetch payment status')
      })
      .catch(() => setError('Could not reach payment status API'))
      .finally(() => setStatusLoading(false))
  }, [orderId])

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt < 1) { setError('Enter a valid amount (min ₹1)'); return }
    if (amt > 100000)    { setError('Amount cannot exceed ₹1,00,000'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, name: name.trim() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error?.message ?? 'Failed to initiate payment')
        return
      }
      // Redirect to PhonePe checkout
      window.location.href = data.data.checkoutUrl
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const stateConfig = status ? (STATE_CONFIG[status.state] ?? { label: status.state, color: '#6b7280', bg: '#f9fafb' }) : null

  return (
    <main style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px' }}>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>PhonePe Payment Test</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 32 }}>
          Sandbox mode — no real money is charged.
        </p>

        {/* Status result (shown after redirect back) */}
        {statusLoading && (
          <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface)', textAlign: 'center', marginBottom: 24 }}>
            Fetching payment status…
          </div>
        )}

        {status && stateConfig && (
          <div style={{
            padding: 20, borderRadius: 12, marginBottom: 32,
            background: stateConfig.bg, border: `1.5px solid ${stateConfig.color}20`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: stateConfig.color, marginBottom: 8 }}>
              {stateConfig.label}
            </div>
            <div style={{ fontSize: 14, color: '#374151', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><b>Amount:</b> ₹{(status.amount / 100).toFixed(2)}</div>
              <div><b>Merchant Order ID:</b> {status.merchantOrderId}</div>
              <div><b>PhonePe Order ID:</b> {status.orderId}</div>
              <div><b>State:</b> {status.state}</div>
              {status.errorCode && <div><b>Error Code:</b> {status.errorCode}</div>}
              {status.detailedErrorCode && <div><b>Detail:</b> {status.detailedErrorCode}</div>}
            </div>
            <button
              onClick={() => window.location.href = '/payment-test'}
              style={{
                marginTop: 16, padding: '8px 16px', borderRadius: 8, border: 'none',
                background: stateConfig.color, color: '#fff', cursor: 'pointer', fontSize: 14,
              }}
            >
              Try another payment
            </button>
          </div>
        )}

        {/* Payment form (hidden if status already shown) */}
        {!orderId && (
          <form onSubmit={handlePay} style={{
            background: 'var(--surface)', borderRadius: 16,
            padding: 24, border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 15,
                  border: '1.5px solid var(--border)', background: 'var(--background)',
                  color: 'var(--text)', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Amount (₹) <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 99"
                min={1}
                max={100000}
                required
                style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 15,
                  border: '1.5px solid var(--border)', background: 'var(--background)',
                  color: 'var(--text)', outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{ color: '#dc2626', fontSize: 13, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px', borderRadius: 10, border: 'none',
                background: loading ? '#94a3b8' : '#5a3fcf',
                color: '#fff', fontWeight: 600, fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Redirecting to PhonePe…' : 'Pay with PhonePe'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', margin: 0 }}>
              You will be redirected to PhonePe&apos;s secure checkout page.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
