import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OrderDetailView } from '@/components/orders/OrderDetailView'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Card } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useAdminOrder, useUpdateOrderStatus } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { OrderDto, OrderStatus } from '@/types/api'
import { orderStatusLabel } from '@/utils/format'

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: 'Confirmed',
  Confirmed: 'Processing',
  Processing: 'Shipped',
  Shipped: 'OutForDelivery',
  OutForDelivery: 'Delivered',
}
const CANCELLABLE: OrderStatus[] = ['Pending', 'Confirmed', 'Processing']

function StatusPanel({ order }: { order: OrderDto }) {
  const update = useUpdateOrderStatus()
  const [tracking, setTracking] = useState(order.trackingNumber ?? '')
  const [cancelling, setCancelling] = useState(false)
  const next = NEXT[order.status]
  const needsTracking = next === 'Shipped'

  return (
    <Card className="grid gap-4 p-5">
      <div>
        <p className="eyebrow mb-1">Customer</p>
        <p className="font-semibold">{order.customerName}</p>
        <p className="text-[0.85rem] text-muted">{order.customerEmail}</p>
      </div>
      {next ? (
        <div className="grid gap-3 border-t border-line pt-4">
          <p className="eyebrow">Next step</p>
          {needsTracking && <Input label="Courier tracking number" optional value={tracking} onChange={(e) => setTracking(e.target.value)} className="font-mono" />}
          <Button variant="accent" fullWidth loading={update.isPending && update.variables?.body.status === next} onClick={() => update.mutate({ orderNumber: order.orderNumber, body: { status: next, trackingNumber: tracking.trim() || null } })}>
            Mark as {orderStatusLabel[next].toLowerCase()}
          </Button>
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-[0.88rem] text-muted">This order is {orderStatusLabel[order.status].toLowerCase()}. No further steps.</p>
      )}
      {CANCELLABLE.includes(order.status) && (
        <Button variant="danger" fullWidth onClick={() => setCancelling(true)}>
          Cancel order
        </Button>
      )}
      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        onConfirm={() => update.mutate({ orderNumber: order.orderNumber, body: { status: 'Cancelled' } }, { onSettled: () => setCancelling(false) })}
        loading={update.isPending}
        danger
        title={`Cancel order #${order.orderNumber}?`}
        message="Items go back into stock and the customer sees the order as cancelled. Refund any prepaid amount through your payment provider."
        confirmLabel="Cancel order"
      />
    </Card>
  )
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { data: order, isPending, isError, error, refetch } = useAdminOrder(orderNumber)
  useEffect(() => {
    document.title = `Order ${orderNumber} · Unique Lights Admin`
  }, [orderNumber])
  return (
    <div>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] text-muted hover:text-ink">
        <ChevronLeft size={16} /> Orders
      </Link>
      <AdminPageHeader title={`Order #${orderNumber}`} />
      {isPending ? (
        <Skeleton className="h-96" />
      ) : isError || !order ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <OrderDetailView order={order} aside={<StatusPanel key={order.status} order={order} />} />
      )}
    </div>
  )
}
