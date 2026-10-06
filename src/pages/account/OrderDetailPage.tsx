import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OrderDetailView } from '@/components/orders/OrderDetailView'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useCancelOrder, useOrder } from '@/features/orders/hooks'

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderNumber)
  const cancel = useCancelOrder()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    document.title = `Order ${orderNumber} · Unique Lights`
  }, [orderNumber])

  return (
    <div>
      <Link to="/account/orders" className="mb-6 inline-flex items-center gap-1 text-[0.88rem] text-muted hover:text-ink">
        <ChevronLeft size={16} /> All orders
      </Link>
      {isPending ? (
        <div className="grid gap-4">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-64" />
        </div>
      ) : isError || !order ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <OrderDetailView
          order={order}
          aside={
            (order.status === 'Pending' || order.status === 'Confirmed') && (
              <Button variant="danger" fullWidth onClick={() => setConfirming(true)}>
                Cancel order
              </Button>
            )
          }
        />
      )}
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => orderNumber && cancel.mutate(orderNumber, { onSettled: () => setConfirming(false) })}
        loading={cancel.isPending}
        danger
        title="Cancel this order?"
        message="We will stop the shipment and refund any payment within 5–7 working days. This cannot be undone."
        confirmLabel="Cancel order"
      />
    </div>
  )
}
