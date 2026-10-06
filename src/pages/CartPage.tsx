import { ArrowRight, Lock, ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { CartLine } from '@/components/cart/CartLine'
import { FreeShippingMeter } from '@/components/cart/CartDrawer'
import { ProductShowcase } from '@/components/home/ProductShowcase'
import { LinkButton } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useCart } from '@/features/cart/hooks'
import { formatMoney } from '@/utils/format'

export default function CartPage() {
  const { cart, isLoading, isError, isGuest, refetch } = useCart()
  useEffect(() => {
    document.title = 'Cart · Unique Lights'
  }, [])

  if (isLoading) {
    return (
      <div className="container-page grid gap-6 py-12">
        <Skeleton className="h-12 w-60" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (isError) return <ErrorState error={new Error('We could not load your cart.')} onRetry={() => void refetch()} className="py-28" />

  if (cart.items.length === 0) {
    return (
      <>
        <EmptyState
          className="py-24"
          icon={<ShoppingBag size={30} />}
          title="Your cart is empty"
          description="Find a pendant, a lamp or a chandelier that makes your evenings better."
          action={
            <LinkButton to="/products" variant="accent">
              Start shopping
            </LinkButton>
          }
        />
        <ProductShowcase eyebrow="Popular right now" title="Bestsellers" query={{ featured: true, pageSize: 4 }} viewAllTo="/products?featured=true" />
      </>
    )
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-[clamp(2.2rem,5vw,3.6rem)]">
        Your cart <span className="font-mono text-[0.4em] text-subtle">({cart.itemCount})</span>
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="divide-y divide-line border-y border-line">
          <AnimatePresence initial={false}>
            {cart.items.map((item) => (
              <CartLine key={item.variantId} item={item} />
            ))}
          </AnimatePresence>
        </ul>

        <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-fit rounded-[var(--radius-card)] border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-[1.5rem]">Order summary</h2>
          <div className="mt-5">
            <FreeShippingMeter subtotal={cart.subtotal} />
          </div>
          <dl className="mt-5 grid gap-3 text-[0.92rem]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-mono tabular">{formatMoney(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery and GST</dt>
              <dd className="text-muted">At checkout</dd>
            </div>
          </dl>
          <LinkButton to="/checkout" variant="accent" size="lg" fullWidth className="mt-6">
            {isGuest ? 'Sign in and check out' : 'Proceed to checkout'} <ArrowRight size={17} />
          </LinkButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.78rem] text-subtle">
            <Lock size={12} /> Secure checkout · Cash on delivery available
          </p>
        </motion.aside>
      </div>
    </div>
  )
}
