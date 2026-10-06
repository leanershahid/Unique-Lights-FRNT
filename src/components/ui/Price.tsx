import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

interface PriceProps {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showSaving?: boolean
}

/** Price with optional struck-through original and saving. Animates when the value changes (e.g. variant switch). */
export function Price({ price, compareAtPrice, size = 'md', className, showSaving }: PriceProps) {
  const discounted = compareAtPrice != null && compareAtPrice > price
  const saving = discounted ? compareAtPrice - price : 0
  const pct = discounted ? Math.round((saving / compareAtPrice) * 100) : 0
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-1', className)}>
      <span className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={price}
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-60%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'tabular font-display text-ink',
              size === 'sm' && 'text-[1.02rem]',
              size === 'md' && 'text-[1.25rem]',
              size === 'lg' && 'text-[2rem] leading-none',
            )}
          >
            {formatPrice(price)}
          </motion.span>
        </AnimatePresence>
      </span>
      {discounted && (
        <>
          <span className={cn('tabular text-subtle line-through', size === 'lg' ? 'text-[1.05rem]' : 'text-[0.85rem]')}>
            {formatPrice(compareAtPrice)}
          </span>
          {showSaving && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.75rem] font-semibold text-success">
              Save {formatPrice(saving)} ({pct}%)
            </span>
          )}
        </>
      )}
    </div>
  )
}
