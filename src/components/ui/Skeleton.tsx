import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

/** Placeholder matching ProductCard's footprint. */
export function ProductCardSkeleton() {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-media)]" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="grid gap-3 p-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  )
}
