export function HoroscopeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Section tabs skeleton */}
      <div className="flex gap-1 border-b border-border pb-0">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-28 rounded bg-muted/50" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-muted/50 rounded w-full" />
        <div className="h-4 bg-muted/50 rounded w-5/6" />
        <div className="h-4 bg-muted/50 rounded w-4/6" />
        <div className="h-4 bg-muted/50 rounded w-full" />
        <div className="h-4 bg-muted/50 rounded w-3/4" />
      </div>
      {/* Chips skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 border border-border" />
        ))}
      </div>
    </div>
  )
}
