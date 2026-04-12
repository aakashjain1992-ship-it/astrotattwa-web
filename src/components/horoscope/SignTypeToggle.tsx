'use client'

import type { SignType } from '@/types/horoscope'
import { cn } from '@/lib/utils'

interface SignTypeToggleProps {
  value: SignType
  onChange: (v: SignType) => void
}

export function SignTypeToggle({ value, onChange }: SignTypeToggleProps) {
  // Sun sign generation is currently disabled — toggle hidden until re-enabled
  void value; void onChange
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>🌙</span>
      <span className="font-medium text-foreground">Moon Sign</span>
    </div>
  )
}
