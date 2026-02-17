'use client'

import { useEffect, useRef } from 'react'

const SYMS = ['☉', '☽', '♂', '♃', '♀', '♄', '☿', '☊', '☋']

export function Glyphs() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    SYMS.forEach((s, i) => {
      const el = document.createElement('div')
      el.textContent = s
      el.style.cssText = `
        position:absolute;
        color:var(--blue);
        opacity:0;
        left:${4 + Math.random() * 40}%;
        bottom:${5 + Math.random() * 65}%;
        font-size:${13 + Math.random() * 9}px;
        --d:${15 + Math.random() * 15}s;
        --dl:${i * 2.6}s;
        animation:gFloat var(--d) ease-in-out var(--dl) infinite;
      `
      container.appendChild(el)
    })
    return () => { container.innerHTML = '' }
  }, [])

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}
