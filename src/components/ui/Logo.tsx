import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface LogoProps {
  /** 'header' = 36px mark + wordmark (default)
   *  'loader' = 96px mark only, for the loading animation */
  variant?: 'header' | 'loader'
  /** Pass undefined to render without a link wrapper */
  href?: string
  className?: string
  style?: CSSProperties
}

/**
 * Astrotattwa Logo component — single source of truth.
 *
 * Public directory files required:
 *   /public/logo-mark.png   — 76×76  transparent PNG (header use)
 *   /public/logo-loader.png — 160×160 transparent PNG (loader animation)
 *
 * Usage:
 *   <Logo />                        — header mark + wordmark with home link
 *   <Logo href={undefined} />       — no link wrapper
 *   <Logo variant="loader" />       — large mark only, for ChartLoader
 */
export function Logo({ variant = 'header', href = '/', className, style }: LogoProps) {

  if (variant === 'loader') {
    return (
      <Image
        src="/logo-loader.png"
        alt="Astrotattwa"
        width={96}
        height={96}
        className={cn('object-contain', className)}
        style={style}
        priority
      />
    )
  }

  // Header variant: mark + wordmark
  const inner = (
    <span className={cn('flex items-center gap-2.5', className)} style={style}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={36}
        height={36}
        className="flex-shrink-0 object-contain"
        priority
      />
      <span
        className="font-serif tracking-wide"
        style={{ fontSize: '19px', lineHeight: 1 }}
      >
        Astro
        <span className="text-primary">tattwa</span>
      </span>
    </span>
  )

  if (href === undefined) return inner

  return (
    <Link
      href={href}
      className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
    >
      {inner}
    </Link>
  )
}
