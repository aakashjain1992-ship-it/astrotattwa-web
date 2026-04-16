'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinkleOffset: number
  driftX: number
  driftY: number
  driftSpeed: number
}

function generateStars(w: number, h: number): Star[] {
  const stars: Star[] = []

  const add = (
    count: number,
    sMin: number, sMax: number,
    opMin: number, opMax: number,
    spMin: number, spMax: number,
    driftAmt: number,
  ) => {
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: sMin + Math.random() * (sMax - sMin),
        baseOpacity: opMin + Math.random() * (opMax - opMin),
        twinkleSpeed: spMin + Math.random() * (spMax - spMin),
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * driftAmt,
        driftY: (Math.random() - 0.5) * driftAmt * 0.4,
        driftSpeed: 0.12 + Math.random() * 0.32,
      })
    }
  }

  add(250, 0.3, 0.7,  0.18, 0.42, 0.2, 0.6, 0.3)
  add(130, 0.5, 1.1,  0.28, 0.55, 0.4, 1.0, 0.5)
  add(60,  0.8, 1.8,  0.38, 0.72, 0.7, 1.8, 0.9)
  add(14,  1.2, 2.4,  0.55, 0.85, 1.0, 2.2, 0.4)

  for (let i = 0; i < 200; i++) {
    const t = Math.random()
    stars.push({
      x: w * (0.02 + t * 0.96),
      y: h * (0.6 - t * 0.35) + (Math.random() - 0.5) * h * 0.36,
      size: 0.25 + Math.random() * 0.65,
      baseOpacity: 0.12 + Math.random() * 0.28,
      twinkleSpeed: 0.15 + Math.random() * 0.55,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.12,
      driftSpeed: 0.08 + Math.random() * 0.18,
    })
  }

  return stars
}

// Nebula definitions — cx/cy/rx/ry as fractions of canvas size
const NEBULAE = [
  { cx: 0.10, cy: 0.22, rx: 0.40, ry: 0.52, darkR: '65,105,220',  lightR: '80,100,200',  darkA: 0.13, lightA: 0.06 },
  { cx: 0.75, cy: 0.68, rx: 0.30, ry: 0.38, darkR: '110,45,200',  lightR: '100,60,190',  darkA: 0.10, lightA: 0.05 },
  { cx: 0.50, cy: 0.12, rx: 0.28, ry: 0.35, darkR: '45,95,210',   lightR: '60,90,200',   darkA: 0.09, lightA: 0.04 },
  { cx: 0.88, cy: 0.30, rx: 0.22, ry: 0.28, darkR: '85,35,175',   lightR: '90,50,170',   darkA: 0.08, lightA: 0.04 },
  { cx: 0.35, cy: 0.50, rx: 0.18, ry: 0.22, darkR: '180,130,60',  lightR: '140,100,40',  darkA: 0.04, lightA: 0.02 },
]

export function Galaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let stars: Star[] = []
    let time = 0
    let isDark = document.documentElement.classList.contains('dark')

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) { animId = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      // Nebulae
      for (const n of NEBULAE) {
        const gx = w * n.cx
        const gy = h * n.cy
        const rx = w * n.rx
        const ry = h * n.ry
        const r = isDark ? n.darkR : n.lightR
        const a = isDark ? n.darkA : n.lightA
        ctx.save()
        ctx.translate(gx, gy)
        ctx.scale(1, ry / rx)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
        grad.addColorStop(0,    `rgba(${r},${a})`)
        grad.addColorStop(0.35, `rgba(${r},${(a * 0.55).toFixed(3)})`)
        grad.addColorStop(0.7,  `rgba(${r},${(a * 0.18).toFixed(3)})`)
        grad.addColorStop(1,    `rgba(${r},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(0, 0, rx, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Stars — light (cool white) in dark mode, deep navy in light mode
      const starRGB = isDark ? '200,225,255' : '25,55,130'

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset)
        const alpha = s.baseOpacity * (0.55 + 0.45 * twinkle)
        const px = s.x + s.driftX * Math.sin(time * s.driftSpeed + s.twinkleOffset)
        const py = s.y + s.driftY * Math.cos(time * s.driftSpeed * 0.7 + s.twinkleOffset)

        if (s.size > 1.4 && alpha > 0.45) {
          const glowRGB = isDark ? '200,225,255' : '30,60,140'
          const glow = ctx.createRadialGradient(px, py, 0, px, py, s.size * 4)
          glow.addColorStop(0,   `rgba(${glowRGB},${(alpha * 0.4).toFixed(3)})`)
          glow.addColorStop(0.5, `rgba(${glowRGB},${(alpha * 0.12).toFixed(3)})`)
          glow.addColorStop(1,   `rgba(${glowRGB},0)`)
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(px, py, s.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(px, py, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starRGB},${alpha.toFixed(3)})`
        ctx.fill()
      }

      time += 0.006
      animId = requestAnimationFrame(draw)
    }

    const setSize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      stars = generateStars(w, h)
    }

    setSize()
    draw()

    window.addEventListener('resize', setSize, { passive: true })

    // Watch for theme changes (.dark class on <html>)
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark')
    })
    themeObserver.observe(document.documentElement, { attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', setSize)
      themeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
