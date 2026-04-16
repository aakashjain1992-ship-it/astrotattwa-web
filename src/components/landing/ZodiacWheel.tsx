// ZodiacWheel — rotating zodiac wheel
// Uses wheel-blue.svg: pre-processed version where white fills → none (transparent)
// and dark fills → #2563EB. No runtime filter needed, works in both light & dark mode.
// Uses yRotate keyframe defined in page.tsx

export function ZodiacWheel() {
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
        animation: 'yRotate 140s linear infinite',
        transformOrigin: 'center center',
      }}
    >
      <img
        src="/zodiac/wheel-blue.svg"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.45,
          display: 'block',
        }}
      />
    </div>
  )
}
