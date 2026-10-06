import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LinkButton } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/Misc'
import { Skeleton } from '@/components/ui/Skeleton'
import { useOrder } from '@/features/orders/hooks'
import { formatDate, formatMoney, paymentMethodLabel } from '@/utils/format'

const RAYS = Array.from({ length: 12 }, (_, i) => (i / 12) * 360)

/** Order confirmation: a bulb-like circle lights up, rays flare, and the tick draws itself. */
export default function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const { data: order } = useOrder(orderNumber)
  const reduce = useReducedMotion() ?? false

  useEffect(() => {
    document.title = `Order ${orderNumber ?? ''} confirmed · Unique Lights`
  }, [orderNumber])

  return (
    <section className="container-page flex flex-col items-center py-16 text-center lg:py-24">
      <div className="relative flex size-44 items-center justify-center">
        {!reduce && (
          <>
            <motion.span className="absolute inset-0 rounded-full bg-brass/30 blur-3xl" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 1.6, 1.2], opacity: [0, 0.9, 0.55] }} transition={{ duration: 1.4, ease: 'easeOut' }} />
            {RAYS.map((deg, i) => (
              <motion.span
                key={deg}
                className="absolute left-1/2 top-1/2 h-0.5 w-10 origin-left rounded-full bg-gradient-to-r from-brass to-transparent"
                style={{ rotate: deg }}
                initial={{ x: 40, opacity: 0, scaleX: 0.2 }}
                animate={{ x: [40, 64, 78], opacity: [0, 1, 0], scaleX: [0.2, 1, 0.6] }}
                transition={{ duration: 0.9, delay: 0.45 + i * 0.015, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
        <motion.div
          className="relative flex size-28 items-center justify-center rounded-full bg-brass text-on-brass shadow-[0_0_60px_10px_var(--ul-glow)]"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
        >
          <svg viewBox="0 0 52 52" className="size-14" fill="none" aria-hidden="true">
            <motion.path d="M14 27 L23 36 L39 17" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }} />
          </svg>
        </motion.div>
      </div>

      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="eyebrow mt-10">
        Thank you{order?.shippingAddress.fullName ? `, ${order.shippingAddress.fullName.split(' ')[0]}` : ''}
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }} className="mt-3 text-[clamp(2.4rem,6vw,4.4rem)]">
        Order confirmed
      </motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} className="mt-4 flex items-center gap-2 font-mono text-[1.05rem] text-muted">
        Order <span className="text-ink">#{orderNumber}</span>
        {orderNumber && <CopyButton text={orderNumber} label="Copy order number" />}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-10 w-full max-w-lg rounded-[var(--radius-card)] border border-line bg-surface p-6 text-left">
        {order ? (
          <dl className="grid gap-3 text-[0.92rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Estimated delivery</dt>
              <dd className="text-right text-ink">{formatDate(order.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'long' })}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Payment</dt>
              <dd className="text-right">
                {paymentMethodLabel[order.payment.method]} · {order.payment.status === 'Paid' ? 'Paid' : 'Pay on delivery'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Items</dt>
              <dd>{order.items.reduce((n, i) => n + i.quantity, 0)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-[1.3rem] tabular">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35 }} className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton to="/products" variant="outline" size="lg">
          Continue shopping
        </LinkButton>
        <LinkButton to={`/account/orders/${orderNumber}`} variant="accent" size="lg">
          View order
        </LinkButton>
      </motion.div>
    </section>
  )
}
