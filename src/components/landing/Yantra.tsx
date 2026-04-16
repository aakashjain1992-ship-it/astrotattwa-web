export function Yantra() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '-8%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '62vw',
        maxWidth: '800px',
        aspectRatio: '1/1',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">

        <defs>
          {/* Sphere gradients — cx/cy offset creates 3-D highlight */}
          <radialGradient id="pSun" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#FFF5A0"/>
            <stop offset="55%"  stopColor="#F5A623"/>
            <stop offset="100%" stopColor="#B85C00"/>
          </radialGradient>
          <radialGradient id="pMoon" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#FFFFFF"/>
            <stop offset="55%"  stopColor="#C0C0D0"/>
            <stop offset="100%" stopColor="#707090"/>
          </radialGradient>
          <radialGradient id="pMars" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#FF9898"/>
            <stop offset="55%"  stopColor="#CC2020"/>
            <stop offset="100%" stopColor="#600000"/>
          </radialGradient>
          <radialGradient id="pMerc" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#98FFD0"/>
            <stop offset="55%"  stopColor="#18A060"/>
            <stop offset="100%" stopColor="#004030"/>
          </radialGradient>
          <radialGradient id="pJup" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#FFF090"/>
            <stop offset="55%"  stopColor="#D49C10"/>
            <stop offset="100%" stopColor="#7A5600"/>
          </radialGradient>
          <radialGradient id="pVen" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#FFF0FF"/>
            <stop offset="55%"  stopColor="#B880D8"/>
            <stop offset="100%" stopColor="#6830A0"/>
          </radialGradient>
          <radialGradient id="pSat" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#9898E8"/>
            <stop offset="55%"  stopColor="#3838A0"/>
            <stop offset="100%" stopColor="#080840"/>
          </radialGradient>
          <radialGradient id="pRahu" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#A880C8"/>
            <stop offset="55%"  stopColor="#583878"/>
            <stop offset="100%" stopColor="#201030"/>
          </radialGradient>
          <radialGradient id="pKetu" cx="35%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#E89870"/>
            <stop offset="55%"  stopColor="#A83820"/>
            <stop offset="100%" stopColor="#501000"/>
          </radialGradient>
        </defs>

        {/* ── Ring A — slow outer lotus ── */}
        <g style={{ animation: 'yRotate 90s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="288" stroke="#2563EB" strokeWidth=".75" opacity=".18"/>
          <circle cx="300" cy="300" r="265" stroke="#2563EB" strokeWidth=".55" opacity=".13"/>
          <g opacity=".35">
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
              <ellipse key={deg} cx="300" cy="54" rx="11" ry="30"
                stroke="#2563EB" strokeWidth=".55"
                transform={deg ? `rotate(${deg} 300 300)` : undefined}/>
            ))}
          </g>
        </g>

        {/* ── Ring B — medium triangles ── */}
        <g style={{ animation: 'yRotate 65s linear infinite reverse', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="225" stroke="#2563EB" strokeWidth=".65" opacity=".28"/>
          <circle cx="300" cy="300" r="195" stroke="#2563EB" strokeWidth=".5"  opacity=".2"/>
          <g opacity=".32">
            {[0,45,90,135,180,225,270,315].map(deg => (
              <ellipse key={deg} cx="300" cy="98" rx="9" ry="22"
                stroke="#2563EB" strokeWidth=".55"
                transform={deg ? `rotate(${deg} 300 300)` : undefined}/>
            ))}
          </g>
          <polygon points="300,112 459,400 141,400" stroke="#2563EB" strokeWidth="1.2" fill="none" opacity=".38"/>
          <polygon points="300,488 141,200 459,200" stroke="#2563EB" strokeWidth="1.2" fill="none" opacity=".38"/>
        </g>

        {/* ═══════════════════════════════════════════
            OUTER PLANETS  (behind Ring C)
            orbital radii: Jupiter 268, Saturn 243,
            Rahu/Ketu 218, Mars 193
        ═══════════════════════════════════════════ */}

        {/* Jupiter — r=268, start top-right (45°), 88s CW */}
        <g style={{ animation: 'yRotate 88s linear infinite', transformOrigin: '300px 300px' }}>
          {/* soft aura */}
          <circle cx="489" cy="111" r="14" fill="rgba(212,160,16,0.12)"/>
          {/* sphere */}
          <circle cx="489" cy="111" r="8"  fill="url(#pJup)" opacity=".88"/>
          {/* thin orbit pulse ring */}
          <circle cx="489" cy="111" r="11" fill="none" stroke="#D4A010" strokeWidth=".6" opacity=".38"/>
        </g>

        {/* Saturn — r=243, start bottom-left (210°), 108s CW */}
        {/* 210°: x=300+243*cos210=300-210=90, y=300+243*sin210=300-121.5=178.5 */}
        <g style={{ animation: 'yRotate 108s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="90" cy="179" r="13" fill="rgba(56,56,160,0.12)"/>
          {/* Saturn ring — tilted ellipse, drawn before sphere so sphere sits in front */}
          <ellipse cx="90" cy="179" rx="16" ry="5.5"
            fill="none" stroke="#6868C0" strokeWidth="1.4" opacity=".55"
            transform="rotate(-18 90 179)"/>
          <circle cx="90" cy="179" r="7"  fill="url(#pSat)" opacity=".88"/>
        </g>

        {/* Rahu + Ketu — always 180° apart, r=218, 70s CW */}
        {/* Rahu start right (0°): cx=518, Ketu left: cx=82 */}
        <g style={{ animation: 'yRotate 70s linear infinite', transformOrigin: '300px 300px' }}>
          {/* Rahu */}
          <circle cx="518" cy="300" r="10" fill="rgba(88,56,120,0.15)"/>
          <circle cx="518" cy="300" r="5.5" fill="url(#pRahu)" opacity=".80"/>
          {/* Ketu */}
          <circle cx="82"  cy="300" r="10" fill="rgba(168,56,32,0.12)"/>
          <circle cx="82"  cy="300" r="5"  fill="url(#pKetu)" opacity=".78"/>
        </g>

        {/* Mars — r=193, start top (270°): cx=300, cy=107, 52s CCW */}
        <g style={{ animation: 'yRotate 52s linear infinite reverse', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="107" r="10" fill="rgba(200,30,30,0.12)"/>
          <circle cx="300" cy="107" r="5.5" fill="url(#pMars)" opacity=".84"/>
          <circle cx="300" cy="107" r="8.5" fill="none" stroke="#CC2020" strokeWidth=".5" opacity=".32"/>
        </g>

        {/* ── Ring C — inner fast ── */}
        <g style={{ animation: 'yRotate 44s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="158" stroke="#2563EB" strokeWidth=".6"  opacity=".28"/>
          <circle cx="300" cy="300" r="128" stroke="#2563EB" strokeWidth=".5"  opacity=".2"/>
          <polygon points="300,158 413,366 187,366" stroke="#2563EB" strokeWidth="1.0"  fill="none" opacity=".38"/>
          <polygon points="300,442 187,234 413,234" stroke="#2563EB" strokeWidth="1.0"  fill="none" opacity=".38"/>
          <polygon points="300,198 390,354 210,354" stroke="#2563EB" strokeWidth=".85" fill="none" opacity=".32"/>
          <polygon points="300,402 210,246 390,246" stroke="#2563EB" strokeWidth=".85" fill="none" opacity=".32"/>
          <polygon points="300,236 368,352 232,352" stroke="#2563EB" strokeWidth=".7"  fill="none" opacity=".28"/>
          <polygon points="300,364 232,248 368,248" stroke="#2563EB" strokeWidth=".7"  fill="none" opacity=".28"/>
        </g>

        {/* ═══════════════════════════════════════════
            INNER PLANETS  (in front of Ring C)
            orbital radii: Sun 158, Venus 126,
            Mercury 92, Moon 56
        ═══════════════════════════════════════════ */}

        {/* Sun — r=158, start left (180°): cx=142, cy=300, 40s CW */}
        <g style={{ animation: 'yRotate 40s linear infinite', transformOrigin: '300px 300px' }}>
          {/* corona glow */}
          <circle cx="142" cy="300" r="18" fill="rgba(245,166,35,0.10)"/>
          <circle cx="142" cy="300" r="13" fill="rgba(245,166,35,0.08)"/>
          <circle cx="142" cy="300" r="7"  fill="url(#pSun)" opacity=".92"/>
          <circle cx="142" cy="300" r="10" fill="none" stroke="#F5A623" strokeWidth=".6" opacity=".40"/>
        </g>

        {/* Venus — r=126, start bottom-right (315°), 28s CCW */}
        {/* 315°: x=300+126*cos315=300+89=389, y=300+126*sin315=300-89=211 */}
        <g style={{ animation: 'yRotate 28s linear infinite reverse', transformOrigin: '300px 300px' }}>
          <circle cx="389" cy="211" r="9"  fill="rgba(184,128,216,0.14)"/>
          <circle cx="389" cy="211" r="5"  fill="url(#pVen)" opacity=".84"/>
        </g>

        {/* Mercury — r=92, start bottom (90°): cx=300, cy=392, 18s CW */}
        <g style={{ animation: 'yRotate 18s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="392" r="7"  fill="rgba(24,160,96,0.14)"/>
          <circle cx="300" cy="392" r="4"  fill="url(#pMerc)" opacity=".82"/>
        </g>

        {/* Moon — r=56, start top-left (225°), 11s CCW */}
        {/* 225°: x=300+56*cos225=300-40=260, y=300+56*sin225=300-40=260 */}
        <g style={{ animation: 'yRotate 11s linear infinite reverse', transformOrigin: '300px 300px' }}>
          <circle cx="260" cy="260" r="8"  fill="rgba(180,180,200,0.16)"/>
          <circle cx="260" cy="260" r="4.5" fill="url(#pMoon)" opacity=".90"/>
        </g>

        {/* Centre dot — always on top */}
        <circle cx="300" cy="300" r="5" fill="#2563EB" opacity=".5"/>
        <circle cx="300" cy="300" r="2" fill="#2563EB" opacity=".75"/>

      </svg>
    </div>
  )
}
