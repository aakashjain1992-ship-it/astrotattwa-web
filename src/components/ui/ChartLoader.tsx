'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Logo } from '@/components/ui/Logo'

interface ChartLoaderProps {
  visible: boolean
}

/**
 * Full-screen overlay shown while /api/calculate is running.
 * Matches the HTML prototype exactly:
 *   - Frosted glass backdrop
 *   - Dashed spinning halos
 *   - SVG orbital rings with planet dots
 *   - 6 sparkle stars
 *   - Logo breathing + spinning
 *   - Cycling text messages
 *   - Bouncing dots
 */
export function ChartLoader({ visible }: ChartLoaderProps) {
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true }, [])

  const content = (
    <>
      {/* ── Keyframes (injected once) ── */}
      <style>{`
        @keyframes cl-spin-cw  { to { transform:rotate(360deg); } }
        @keyframes cl-spin-ccw { to { transform:rotate(-360deg); } }
        @keyframes cl-pulse {
          0%,100% { opacity:.55; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.05); }
        }
        @keyframes cl-spark-pop {
          0%,100% { opacity:0; transform:scale(.25) rotate(0deg); }
          45%,55% { opacity:1; transform:scale(1)   rotate(45deg); }
        }
        .cl-logo-spinner  { animation:cl-spin-cw 20s linear infinite; }
        @keyframes cl-breathe {
          0%,100% { transform:scale(1);    filter:drop-shadow(0 0 14px rgba(37,99,235,.45)) drop-shadow(0 0 4px rgba(147,197,253,.25)); }
          50%      { transform:scale(1.1);  filter:drop-shadow(0 0 28px rgba(37,99,235,.8))  drop-shadow(0 0 10px rgba(147,197,253,.5)); }
        }
        .cl-logo-breather { animation:cl-breathe 2.6s ease-in-out infinite; }
        @keyframes cl-msg-fade {
          0%      { opacity:0; transform:translateX(-50%) translateY(5px); }
          10%,25% { opacity:1; transform:translateX(-50%) translateY(0); }
          33%     { opacity:0; transform:translateX(-50%) translateY(-5px); }
          100%    { opacity:0; }
        }
        @keyframes cl-dot-up {
          0%,100% { opacity:.2; transform:scale(.7) translateY(0); }
          50%      { opacity:1;  transform:scale(1)  translateY(-5px); }
        }
      `}</style>

      {/* ── Overlay ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'all' : 'none',
          transition: 'opacity .35s ease',
        }}
        aria-hidden={!visible}
      >
        {/* Stage */}
        <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Dashed halos */}
          <div style={{ position:'absolute', borderRadius:'50%', border:'1px dashed rgba(37,99,235,.22)', width:270, height:270, animation:'cl-spin-cw 30s linear infinite' }} />
          <div style={{ position:'absolute', borderRadius:'50%', border:'1px dashed rgba(37,99,235,.12)', width:248, height:248, animation:'cl-spin-ccw 42s linear infinite' }} />

          {/* Glow rings */}
          <div style={{ position:'absolute', borderRadius:'50%', border:'1.5px solid rgba(37,99,235,.4)', boxShadow:'0 0 22px 4px rgba(37,99,235,.1)', animation:'cl-pulse 2.6s ease-in-out infinite', width:158, height:158 }} />
          <div style={{ position:'absolute', borderRadius:'50%', border:'1.5px solid rgba(37,99,235,.18)', boxShadow:'0 0 22px 4px rgba(37,99,235,.1)', animation:'cl-pulse 2.6s ease-in-out infinite .85s', width:184, height:184 }} />

          {/* Orbital SVG rings */}
          <svg style={{ position:'absolute', width:230, height:230, overflow:'visible' }} viewBox="0 0 230 230">
            <defs>
              <filter id="cl-pg">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 115 115" to="360 115 115" dur="13s" repeatCount="indefinite"/>
              <ellipse cx="115" cy="115" rx="105" ry="30" stroke="rgba(37,99,235,.5)" strokeWidth="1.2" fill="none" transform="rotate(-30 115 115)"/>
              <circle cx="220" cy="115" r="5" fill="#2563EB" filter="url(#cl-pg)" transform="rotate(-30 115 115)"/>
              <circle cx="10"  cy="115" r="3.5" fill="#3B82F6" filter="url(#cl-pg)" opacity=".7" transform="rotate(-30 115 115)"/>
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 115 115" to="-360 115 115" dur="19s" repeatCount="indefinite"/>
              <ellipse cx="115" cy="115" rx="105" ry="30" stroke="rgba(37,99,235,.28)" strokeWidth="1" fill="none" transform="rotate(30 115 115)"/>
              <circle cx="220" cy="115" r="4" fill="#93C5FD" filter="url(#cl-pg)" transform="rotate(30 115 115)"/>
              <circle cx="10"  cy="115" r="3"  fill="#60A5FA" filter="url(#cl-pg)" opacity=".6" transform="rotate(30 115 115)"/>
            </g>
          </svg>

          {/* Sparkles */}
          {[
            { sd:'2.2s', ss:'0s',   top:16,  left:178, w:12, h:12 },
            { sd:'3.1s', ss:'.7s',  top:44,  left:32,  w:12, h:12 },
            { sd:'2.7s', ss:'1.2s', top:228, left:188, w:12, h:12 },
            { sd:'3.5s', ss:'.3s',  top:236, left:40,  w:12, h:12 },
            { sd:'2.4s', ss:'1.6s', top:8,   left:122, w:12, h:12 },
            { sd:'3.3s', ss:'1.4s', top:128, left:268, w:12, h:12 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position:'absolute',
                top: s.top,
                left: s.left,
                width: s.w,
                height: s.h,
                animation: `cl-spark-pop ${s.sd} ease-in-out infinite ${s.ss}`,
              }}
            >
              {/* Cross arms via pseudo via inline SVG */}
              <svg width={s.w} height={s.h} viewBox="0 0 12 12" fill="#2563EB" opacity=".7">
                <rect x="0" y="5" width="12" height="2" rx="1"/>
                <rect x="5" y="0" width="2" height="12" rx="1"/>
              </svg>
            </div>
          ))}

          {/* Logo */}
          <div className="cl-logo-spinner">
            <div className="cl-logo-breather">
              <Logo
                variant="loader"
                href={undefined}
                className="block"
                style={{ filter:'drop-shadow(0 0 16px rgba(37,99,235,.5)) drop-shadow(0 0 5px rgba(147,197,253,.3))' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Text + dots below stage */}
          <div style={{ position:'absolute', bottom:-62, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ position:'relative', height:18, width:220 }}>
              {[
                { msg:'Reading the stars',       delay:'0s' },
                { msg:'Calculating your chart',  delay:'3s' },
                { msg:'Aligning the Grahas',     delay:'6s' },
              ].map(({ msg, delay }) => (
                <span
                  key={msg}
                  style={{
                    position:'absolute',
                    left:'50%',
                    transform:'translateX(-50%)',
                    fontSize:12.5,
                    fontWeight:400,
                    letterSpacing:.5,
                    color:'rgba(13,17,34,.5)',
                    whiteSpace:'nowrap',
                    opacity:0,
                    animation:`cl-msg-fade 9s ease-in-out infinite ${delay}`,
                  }}
                >
                  {msg}
                </span>
              ))}
            </div>
            <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:12 }}>
              {[0, '.18s', '.36s'].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width:5, height:5, borderRadius:'50%', background:'#2563EB',
                    animation:`cl-dot-up 1.3s ease-in-out infinite ${delay}`,
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
 if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

