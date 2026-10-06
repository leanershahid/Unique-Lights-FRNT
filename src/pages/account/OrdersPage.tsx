import { ChevronRight, Package } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { staggerContainer, staggerItem } from '@/animations/variants'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useOrders } from '@/features/orders/hooks'
import { formatDate, formatMoney } from '@/utils/format'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useOrders({ page, pageSize: 10 })
  useEffect(() => {
    document.title = 'Orders · Unique Lights'
  }, [])

  if (isPending)
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!data.items.length)
    return (
      <EmptyState
        icon={<Package size={30} />}
        title="No orders yet"
        description="When you place an order, you can track it here."
        action={
          <LinkButton to="/products" variant="accent">
            Start shopping
          </LinkButton>
        }
      />
    )

  return (
    <div>
      <motion.ul key={page} variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="grid gap-3">
        {data.items.map((o) => (
          <motion.li key={o.id} variants={staggerItem}>
            <Link to={`/account/orders/${o.orderNumber}`} className="group flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong sm:flex-nowrap">
              <div className="flex -space-x-3">
                {o.previewImages.slice(0, 3).map((src, i) => (
                  <img key={i} src={src} alt="" className="size-14 rounded-lg border-2 border-surface object-cover" loading="lazy" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.95rem]">#{o.orderNumber}</p>
                <p className="text-[0.82rem] text-muted">
                  {formatDate(o.placedAt)} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
              <p className="w-28 text-right font-mono tabular">{formatMoney(o.total)}</p>
              <ChevronRight size={18} className="text-subtle transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.li>
        ))}
      </motion.ul>
      <Pagination className="mt-8" page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  )
}
