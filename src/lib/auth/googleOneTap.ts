// Shared utility for Google One Tap — used by both the auto-prompt component
// and any manual trigger (e.g. "Continue with Google" buttons in modals).

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

export async function generateNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return { raw, hashed }
}

// Trigger One Tap inline (no redirect). Falls back to standard OAuth redirect
// if the Google script hasn't loaded yet.
export async function triggerGoogleOneTap(returnUrl = '/chart') {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId || !window.google?.accounts?.id) {
    window.location.href = `/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`
    return
  }

  const nonce = await generateNonce()

  window.google.accounts.id.initialize({
    client_id: clientId,
    nonce: nonce.hashed,
    callback: async (res: { credential: string }) => {
      try {
        const r = await fetch('/api/auth/google/onetap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: res.credential, nonce: nonce.raw }),
        })
        if (r.ok) window.location.reload()
      } catch {}
    },
  })

  window.google.accounts.id.prompt()
}
