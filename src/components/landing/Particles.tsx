'use client'

import { useEffect, useRef } from 'react'

export function Particles() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    for (let i = 0; i < 40; i++) {
      const d = document.createElement('div')
      const sz = 0.6 + Math.random() * 2
      d.style.cssText = `
        position:absolute; border-radius:50%;
        background:var(--blue);
        width:${sz}px; height:${sz}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        --d:${2 + Math.random() * 4}s;
        --dl:${Math.random() * 5}s;
        animation:pTwinkle var(--d) ease-in-out var(--dl) infinite;
      `
      container.appendChild(d)
    }
    return () => { container.innerHTML = '' }
  }, [])

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
