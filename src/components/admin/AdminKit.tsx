import { Search } from 'lucide-react'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/utils/cn'

/** Counts up to a value once visible. */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)
  useEffect(() => {
    if (!inView) return
    if (reduce) return setShown(value)
    const controls = animate(0, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setShown })
    return () => controls.stop()
  }, [inView, value, reduce])
  return (
    <span ref={ref} className="tabular">
      {format(shown)}
    </span>
  )
}

export function KpiCard({ label, value, format, icon, delta, index = 0 }: { label: string; value: number; format: (n: number) => string; icon: ReactNode; delta?: number | null; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-5"
    >
      <span className="absolute -right-8 -top-8 size-24 rounded-full bg-brass/10 blur-2xl" aria-hidden="true" />
      <div className="flex items-center justify-between">
        <p className="text-[0.85rem] text-muted">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-full bg-brass/12 text-brass">{icon}</span>
      </div>
      <p className="mt-3 font-display text-[1.9rem] leading-none">
        <CountUp value={value} format={format} />
      </p>
      {delta !== undefined && delta !== null && Number.isFinite(delta) && (
        <p className={cn('mt-2 text-[0.8rem] font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs previous 30 days
        </p>
      )}
    </motion.div>
  )
}

/** Debounced search box for admin lists. */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [draft, setDraft] = useState(value)
  const debounced = useDebounce(draft, 300)
  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })
  useEffect(() => {
    if (debounced !== value) onChangeRef.current(debounced)
  }, [debounced])
  return (
    <label className="relative block w-full max-w-sm">
      <span className="sr-only">{placeholder}</span>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[0.88rem] outline-none transition-colors placeholder:text-subtle focus:border-brass"
      />
    </label>
  )
}

/** Scrollable table shell with consistent styling. */
export function Table({ head, children, className }: { head: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-[0.88rem]">
        <thead className="border-b border-line text-[0.75rem] uppercase tracking-[0.08em] text-subtle">{head}</thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  )
}

export const th = 'px-4 py-3 font-medium'
export const td = 'px-4 py-3 align-middle'

/** Theme colours resolved for SVG chart libraries (which cannot read CSS variables in attributes). */
export function useChartColors() {
  const theme = useAppSelector((s) => s.preferences.theme)
  return useMemo(() => {
    const css = getComputedStyle(document.documentElement)
    const v = (name: string) => css.getPropertyValue(name).trim()
    return { brass: v('--ul-brass'), ink: v('--ul-ink'), muted: v('--ul-muted'), subtle: v('--ul-subtle'), line: v('--ul-line'), surface: v('--ul-surface'), success: v('--ul-success'), danger: v('--ul-danger'), warning: v('--ul-warning') }
    // Recomputed when the theme changes.
  }, [theme])
}
