'use client'
import * as React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  id: string                  // used as localStorage key suffix
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  titleRight?: React.ReactNode // optional right-side content in header
}

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  className,
  titleRight,
}: CollapsibleSectionProps) {
  const storageKey = `panchang_section_${id}`
  const [open, setOpen] = React.useState(defaultOpen)

  // Restore from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) setOpen(stored === 'true')
    } catch {}
  }, [storageKey])

  const toggle = () => {
    const next = !open
    setOpen(next)
    try { localStorage.setItem(storageKey, String(next)) } catch {}
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-sm overflow-hidden', className)}>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
      >
        <span className="font-semibold text-base text-foreground font-serif">{title}</span>
        <div className="flex items-center gap-3">
          {titleRight}
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  )
}
