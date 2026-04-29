'use client'

interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed px-6 py-10 text-center ${className ?? ''}`}
      style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
    >
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  )
}
