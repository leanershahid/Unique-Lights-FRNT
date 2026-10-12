import { ShoppingBag, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { LinkButton } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/States'
import { useCart } from '@/features/cart/hooks'
import { useStoreSettings } from '@/features/store/hooks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCartOpen } from '@/store/slices/uiSlice'
import { formatMoney, formatPrice } from '@/utils/format'
import { CartLine } from './CartLine'

/** Progress towards free delivery. The threshold comes from the store settings API. */
export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const { data: store } = useStoreSettings()
  if (!store || store.freeShippingThreshold <= 0) return null
  const threshold = store.freeShippingThreshold
  const remaining = Math.max(0, threshold - subtotal)
  const pct = Math.min(100, (subtotal / threshold) * 100)
  return (
    <div className="rounded-xl bg-surface-2 p-3.5">
      <p className="flex items-center gap-2 text-[0.85rem] text-muted">
        <Truck size={16} className="text-brass" />
        {remaining > 0 ? (
          <span>
            Add <b className="font-semibold text-ink">{formatPrice(remaining)}</b> more for free standard delivery
          </span>
        ) : (
          <span className="text-success">You have unlocked free standard delivery</span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-brass shadow-[0_0_10px_var(--ul-glow)]" initial={false} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const open = useAppSelector((s) => s.ui.cartOpen)
  const dispatch = useAppDispatch()
  const { cart, isLoading } = useCart()
  const close = () => dispatch(setCartOpen(false))

  return (
    <Drawer
      open={open}
      onClose={close}
      title={
        <span className="flex items-baseline gap-2">
          Your cart <span className="font-mono text-[0.85rem] text-subtle">({cart.itemCount})</span>
        </span>
      }
      footer={
        cart.items.length > 0 ? (
          <div className="grid gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-muted">Subtotal</span>
              <motion.span key={cart.subtotal} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[1.4rem] tabular">
                {formatMoney(cart.subtotal)}
              </motion.span>
            </div>
            <p className="-mt-2 text-[0.8rem] text-subtle">GST and delivery are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <LinkButton to="/cart" variant="outline" onClick={close}>
                View cart
              </LinkButton>
              <LinkButton to="/checkout" variant="accent" onClick={close}>
                Checkout
              </LinkButton>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="grid gap-5 p-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-24 shrink-0" />
              <div className="grid flex-1 content-start gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={30} />}
          title="Your cart is empty"
          description="Find a pendant, a lamp or a chandelier that makes your evenings better."
          action={
            <LinkButton to="/products" variant="accent" onClick={close}>
              Start shopping
            </LinkButton>
          }
        />
      ) : (
        <div className="px-5 sm:px-6">
          <div className="pt-4">
            <FreeShippingMeter subtotal={cart.subtotal} />
          </div>
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <CartLine key={item.variantId} item={item} onNavigate={close} compact />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Drawer>
  )
}
