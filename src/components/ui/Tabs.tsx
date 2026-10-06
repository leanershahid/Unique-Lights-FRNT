import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

/** Underline tabs with a sliding indicator. Arrow keys move between tabs. */
export function Tabs<T extends string>({ items, value, onChange, className }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; className?: string }) {
  const group = useId()
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = items[(index + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length]
    if (next) onChange(next.value)
  }
  return (
    <div role="tablist" className={cn('scrollbar-none flex gap-1 overflow-x-auto border-b border-line', className)}>
      {items.map((t, i) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn('relative shrink-0 px-4 py-3 text-[0.9rem] font-medium transition-colors', active ? 'text-ink' : 'text-muted hover:text-ink')}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 font-mono text-[0.72rem] text-subtle">{t.count}</span>}
            {active && <motion.span layoutId={`tab-${group}`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brass" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          </button>
        )
      })}
    </div>
  )
}
