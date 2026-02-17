import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'header' | 'loader'
  className?: string
}

export function Logo({ variant = 'header', className }: LogoProps) {
  if (variant === 'loader') {
    return (
      <Image
        src="/logo-loader.png"
        alt="Astrotattwa"
        width={96}
        height={96}
        style={{ objectFit: 'contain' }}
      />
    )
  }

  return (
    <Link
      href="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
      className={className}
    >
      <Image
        src="/logo-mark.png"
        alt="Astrotattwa logo"
        width={38}
        height={38}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '-0.3px',
          color: 'var(--text)',
        }}
      >
        Astrotattwa
      </span>
    </Link>
  )
}
