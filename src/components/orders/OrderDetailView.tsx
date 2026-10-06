import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/Misc'
import type { OrderDto } from '@/types/api'
import { formatDate, formatMoney, paymentMethodLabel } from '@/utils/format'
import { OrderTimeline } from './OrderTimeline'

/** Order detail shared by the customer account and the admin order page. */
export function OrderDetailView({ order, productLinkBase = '/products', aside }: { order: OrderDto; productLinkBase?: string; aside?: React.ReactNode }) {
  const a = order.shippingAddress
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-mono text-[1.3rem]">
              #{order.orderNumber} <CopyButton text={order.orderNumber} label="Copy order number" />
            </h2>
            <p className="text-[0.88rem] text-muted">Placed {formatDate(order.placedAt, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 p-4">
              {i.imageUrl && <img src={i.imageUrl} alt="" className="size-16 shrink-0 rounded-lg object-cover" loading="lazy" />}
              <div className="min-w-0 flex-1">
                <Link to={`${productLinkBase}/${i.productSlug}`} className="line-clamp-1 font-display text-[1.05rem] hover:text-brass">
                  {i.productName}
                </Link>
                <p className="text-[0.82rem] text-muted">
                  {i.variantName} · {i.sku}
                </p>
                <p className="text-[0.82rem] text-subtle">
                  {i.quantity} × {formatMoney(i.unitPrice)}
                </p>
              </div>
              <p className="font-mono text-[0.9rem] tabular">{formatMoney(i.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-line p-5">
            <p className="eyebrow mb-2">Delivery address</p>
            <p className="text-[0.92rem] text-muted">
              <b className="font-semibold text-ink">{a.fullName}</b>
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {a.phone}
            </p>
            {order.notes && <p className="mt-3 text-[0.85rem] text-subtle">Note: {order.notes}</p>}
          </div>
          <div className="rounded-[var(--radius-card)] border border-line p-5">
            <p className="eyebrow mb-2">Payment</p>
            <dl className="grid gap-1.5 text-[0.9rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Method</dt>
                <dd>{paymentMethodLabel[order.payment.method]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Status</dt>
                <dd>{order.payment.status}</dd>
              </div>
              {order.payment.transactionReference && (
                <div className="flex justify-between">
                  <dt className="text-muted">Reference</dt>
                  <dd className="font-mono text-[0.8rem]">{order.payment.transactionReference}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-line pt-2">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-mono tabular">{formatMoney(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                  <dd className="font-mono tabular">−{formatMoney(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery ({order.deliveryMethod})</dt>
                <dd className="font-mono tabular">{order.shipping === 0 ? 'Free' : formatMoney(order.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST</dt>
                <dd className="font-mono tabular">{formatMoney(order.tax)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-line pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="font-mono tabular">{formatMoney(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <aside className="grid h-fit gap-6">
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <p className="eyebrow mb-1">Tracking</p>
          {order.estimatedDelivery && order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <p className="mb-4 text-[0.88rem] text-muted">Expected by {formatDate(order.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          )}
          {order.trackingNumber && (
            <p className="mb-4 flex items-center gap-1 font-mono text-[0.82rem] text-muted">
              AWB {order.trackingNumber} <CopyButton text={order.trackingNumber} label="Copy tracking number" />
            </p>
          )}
          <OrderTimeline timeline={order.timeline} />
        </div>
        {aside}
      </aside>
    </div>
  )
}
