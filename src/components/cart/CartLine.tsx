import { Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { useRemoveCartItem, useUpdateCartItem } from '@/features/cart/hooks'
import type { CartItemDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatMoney } from '@/utils/format'

/** One cart row. Enters/exits with height + fade so neighbours slide smoothly (use inside AnimatePresence). */
export function CartLine({ item, onNavigate, compact }: { item: CartItemDto; onNavigate?: () => void; compact?: boolean }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const lowStock = item.availableStock > 0 && item.availableStock <= 5

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, x: 40, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className={cn('flex gap-4', compact ? 'py-4' : 'py-5')}>
        <Link to={`/products/${item.productSlug}`} onClick={onNavigate} className="shrink-0 overflow-hidden rounded-lg bg-surface-2">
          {item.imageUrl && <img src={item.imageUrl} alt="" className={cn('object-cover transition-transform duration-500 hover:scale-105', compact ? 'size-20' : 'size-24 sm:size-28')} loading="lazy" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/products/${item.productSlug}`} onClick={onNavigate} className="line-clamp-2 font-display text-[1.05rem] leading-snug text-ink hover:text-brass">
                {item.productName}
              </Link>
              <p className="mt-0.5 text-[0.82rem] text-muted">{item.variantName}</p>
            </div>
            <motion.p key={item.lineTotal} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="shrink-0 font-mono text-[0.9rem] tabular text-ink">
              {formatMoney(item.lineTotal)}
            </motion.p>
          </div>
          {lowStock && <p className="mt-1 text-[0.78rem] text-warning">Only {item.availableStock} left</p>}
          <div className="mt-auto flex items-center justify-between pt-3">
            <QuantitySelector
              size="sm"
              value={item.quantity}
              max={Math.max(1, Math.min(99, item.availableStock))}
              onChange={(quantity) => update.mutate({ item, quantity })}
            />
            <button
              type="button"
              onClick={() => remove.mutate(item)}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.8rem] text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Remove ${item.productName}`}
            >
              <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  )
}
