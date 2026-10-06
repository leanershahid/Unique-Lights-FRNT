import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1]
    if (prev !== undefined && p - prev > 1) out.push('…')
    out.push(p)
  })
  return out
}

export function Pagination({ page, totalPages, onChange, className }: { page: number; totalPages: number; onChange: (page: number) => void; className?: string }) {
  if (totalPages <= 1) return null
  const item = 'flex size-10 items-center justify-center rounded-full text-[0.88rem] transition-colors'
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button type="button" className={cn(item, 'hover:bg-surface-2 disabled:opacity-30')} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-subtle">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(item, 'relative font-mono tabular', p === page ? 'text-on-brass' : 'hover:bg-surface-2')}
          >
            {p === page && <motion.span layoutId="page-pill" className="absolute inset-0 rounded-full bg-brass" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="relative">{p}</span>
          </button>
        ),
      )}
      <button type="button" className={cn(item, 'hover:bg-surface-2 disabled:opacity-30')} onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
