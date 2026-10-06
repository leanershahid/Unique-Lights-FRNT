import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { collapse } from '@/animations/variants'
import { Checkbox } from '@/components/ui/Choice'
import { Skeleton } from '@/components/ui/Skeleton'
import type { FilterState } from '@/features/products/useProductFilters'
import type { ProductFiltersDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

function Section({ title, children, defaultOpen = true, badge }: { title: string; children: ReactNode; defaultOpen?: boolean; badge?: number }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-1 text-left">
        <span className="flex items-center gap-2 text-[0.92rem] font-semibold text-ink">
          {title}
          {badge ? <span className="rounded-full bg-brass px-1.5 font-mono text-[0.65rem] text-on-brass">{badge}</span> : null}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-subtle" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function priceBands(min: number, max: number): { label: string; min?: number; max?: number }[] {
  if (max <= 0) return []
  const steps = [2000, 5000, 10000, 20000]
  const bands: { label: string; min?: number; max?: number }[] = []
  let prev: number | undefined
  for (const s of steps) {
    if (s <= min) {
      prev = s
      continue
    }
    if (prev !== undefined && prev >= max) break
    bands.push({ label: prev === undefined ? `Under ${formatPrice(s)}` : `${formatPrice(prev)} – ${formatPrice(s)}`, min: prev, max: s })
    prev = s
  }
  if (prev !== undefined && prev < max) bands.push({ label: `Over ${formatPrice(prev)}`, min: prev })
  return bands
}

interface FilterPanelProps {
  value: FilterState
  onChange: (patch: Partial<FilterState>) => void
  options: ProductFiltersDto | undefined
  loading: boolean
}

/** Shared by the desktop sidebar (applies immediately) and the mobile sheet (applies on "Show results"). */
export function FilterPanel({ value, onChange, options, loading }: FilterPanelProps) {
  const [minDraft, setMinDraft] = useState(value.minPrice?.toString() ?? '')
  const [maxDraft, setMaxDraft] = useState(value.maxPrice?.toString() ?? '')
  useEffect(() => {
    setMinDraft(value.minPrice?.toString() ?? '')
    setMaxDraft(value.maxPrice?.toString() ?? '')
  }, [value.minPrice, value.maxPrice])

  if (loading || !options) {
    return (
      <div className="grid gap-4 py-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  const applyPrice = () => {
    const min = minDraft === '' ? undefined : Math.max(0, Number(minDraft))
    const max = maxDraft === '' ? undefined : Math.max(0, Number(maxDraft))
    onChange({ minPrice: min, maxPrice: max !== undefined && min !== undefined && max < min ? min : max })
  }
  const bands = priceBands(options.minPrice, options.maxPrice)
  const chip = (active: boolean) =>
    cn('rounded-full border px-3 py-1.5 text-[0.82rem] transition-colors', active ? 'border-brass bg-brass/12 text-ink' : 'border-line text-muted hover:border-line-strong hover:text-ink')

  return (
    <div>
      <Section title="Availability" badge={(value.inStock ? 1 : 0) + (value.isNew ? 1 : 0) + (value.featured ? 1 : 0)}>
        <Checkbox checked={value.inStock} onChange={(c) => onChange({ inStock: c })} label="In stock only" />
        <Checkbox checked={value.isNew} onChange={(c) => onChange({ isNew: c })} label="New arrivals" />
        <Checkbox checked={value.featured} onChange={(c) => onChange({ featured: c })} label="Bestsellers" />
      </Section>

      <Section title="Price" badge={value.minPrice !== undefined || value.maxPrice !== undefined ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {bands.map((b) => {
            const active = value.minPrice === b.min && value.maxPrice === b.max
            return (
              <button key={b.label} type="button" className={chip(active)} onClick={() => onChange(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: b.min, maxPrice: b.max })}>
                {b.label}
              </button>
            )
          })}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            applyPrice()
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={`Min ${Math.floor(options.minPrice)}`}
            aria-label="Minimum price"
            value={minDraft}
            onChange={(e) => setMinDraft(e.target.value)}
            onBlur={applyPrice}
            className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-[0.85rem] outline-none focus:border-brass"
          />
          <span className="text-subtle">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={`Max ${Math.ceil(options.maxPrice)}`}
            aria-label="Maximum price"
            value={maxDraft}
            onChange={(e) => setMaxDraft(e.target.value)}
            onBlur={applyPrice}
            className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-[0.85rem] outline-none focus:border-brass"
          />
        </form>
      </Section>

      {options.colorTemperatures.length > 0 && (
        <Section title="Colour temperature" badge={value.colorTemperatures.length}>
          <div className="flex flex-wrap gap-2">
            {options.colorTemperatures.map((ct) => (
              <button key={ct} type="button" className={chip(value.colorTemperatures.includes(ct))} onClick={() => onChange({ colorTemperatures: toggle(value.colorTemperatures, ct) })} aria-pressed={value.colorTemperatures.includes(ct)}>
                {ct}
              </button>
            ))}
          </div>
        </Section>
      )}

      {options.finishes.length > 0 && (
        <Section title="Finish" badge={value.finishes.length}>
          {options.finishes.map((f) => (
            <Checkbox key={f} checked={value.finishes.includes(f)} onChange={() => onChange({ finishes: toggle(value.finishes, f) })} label={f} />
          ))}
        </Section>
      )}

      {options.brands.length > 0 && (
        <Section title="Brand" badge={value.brands.length} defaultOpen={options.brands.length <= 6}>
          {options.brands.map((b) => (
            <Checkbox key={b} checked={value.brands.includes(b)} onChange={() => onChange({ brands: toggle(value.brands, b) })} label={b} />
          ))}
        </Section>
      )}
    </div>
  )
}
