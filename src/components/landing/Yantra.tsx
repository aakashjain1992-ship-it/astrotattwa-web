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
      {/* Left-side mask so text stays clean */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: '55%',
          background: 'linear-gradient(to right, white 55%, transparent)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* Ring A — slow outer lotus */}
        <g style={{ animation: 'yRotate 90s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="288" stroke="#2563EB" strokeWidth=".75" opacity=".35"/>
          <circle cx="300" cy="300" r="265" stroke="#2563EB" strokeWidth=".55" opacity=".22"/>
          <g opacity=".35">
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
              <ellipse key={deg} cx="300" cy="54" rx="11" ry="30"
                stroke="#2563EB" strokeWidth=".55"
                transform={deg ? `rotate(${deg} 300 300)` : undefined}/>
            ))}
          </g>
        </g>

        {/* Ring B — medium triangles */}
        <g style={{ animation: 'yRotate 65s linear infinite reverse', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="225" stroke="#2563EB" strokeWidth=".65" opacity=".28"/>
          <circle cx="300" cy="300" r="195" stroke="#2563EB" strokeWidth=".5" opacity=".2"/>
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

        {/* Ring C — inner fast */}
        <g style={{ animation: 'yRotate 44s linear infinite', transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r="158" stroke="#2563EB" strokeWidth=".6" opacity=".28"/>
          <circle cx="300" cy="300" r="128" stroke="#2563EB" strokeWidth=".5" opacity=".2"/>
          <polygon points="300,158 413,366 187,366" stroke="#2563EB" strokeWidth="1.0" fill="none" opacity=".38"/>
          <polygon points="300,442 187,234 413,234" stroke="#2563EB" strokeWidth="1.0" fill="none" opacity=".38"/>
          <polygon points="300,198 390,354 210,354" stroke="#2563EB" strokeWidth=".85" fill="none" opacity=".32"/>
          <polygon points="300,402 210,246 390,246" stroke="#2563EB" strokeWidth=".85" fill="none" opacity=".32"/>
          <polygon points="300,236 368,352 232,352" stroke="#2563EB" strokeWidth=".7" fill="none" opacity=".28"/>
          <polygon points="300,364 232,248 368,248" stroke="#2563EB" strokeWidth=".7" fill="none" opacity=".28"/>
          <circle cx="300" cy="300" r="5" fill="#2563EB" opacity=".5"/>
          <circle cx="300" cy="300" r="2" fill="#2563EB" opacity=".7"/>
        </g>

      </svg>
    </div>
  )
}
