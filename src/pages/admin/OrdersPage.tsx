import { ShoppingCart } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchBox, Table, td, th } from '@/components/admin/AdminKit'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { useAdminOrders } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { OrderStatus } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDateTime, formatMoney, orderStatusLabel } from '@/utils/format'

const FILTERS: (OrderStatus | 'all')[] = ['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled']

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const search = params.get('search') ?? ''
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminOrders({ status, search: search || undefined, page, pageSize: 20 })
  useEffect(() => {
    document.title = 'Orders · Unique Lights Admin'
  }, [])
  const set = (patch: Record<string, string | undefined>) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => (v && v !== 'all' ? next.set(k, v) : next.delete(k)))
      if (!('page' in patch)) next.delete('page')
      return next
    })

  return (
    <div>
      <AdminPageHeader title="Orders" description="Confirm, pack, ship and deliver." />
      <div className="mb-4">
        <SearchBox value={search} onChange={(v) => set({ search: v })} placeholder="Order number, name or email" />
      </div>
      <Tabs className="mb-4" value={status ?? 'all'} onChange={(v) => set({ status: v })} items={FILTERS.map((f) => ({ value: f, label: f === 'all' ? 'All' : orderStatusLabel[f] }))} />
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data.items.length ? (
        <EmptyState icon={<ShoppingCart size={30} />} title="No orders here" description={status ? 'No orders have this status right now.' : 'Orders appear here as soon as customers check out.'} />
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <Table
            head={
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Placed</th>
                <th className={cn(th, 'text-right')}>Items</th>
                <th className={th}>Status</th>
                <th className={cn(th, 'text-right')}>Total</th>
              </tr>
            }
          >
            {data.items.map((o) => (
              <tr key={o.id} tabIndex={0} onClick={() => navigate(`/admin/orders/${o.orderNumber}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/orders/${o.orderNumber}`)} className="cursor-pointer transition-colors hover:bg-surface-2/60 focus-visible:bg-surface-2/60">
                <td className={cn(td, 'font-mono')}>#{o.orderNumber}</td>
                <td className={td}>
                  <p>{o.customerName}</p>
                  <p className="text-[0.78rem] text-subtle">{o.customerEmail}</p>
                </td>
                <td className={cn(td, 'text-muted')}>{formatDateTime(o.placedAt)}</td>
                <td className={cn(td, 'text-right font-mono tabular')}>{o.itemCount}</td>
                <td className={td}>
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className={cn(td, 'text-right font-mono tabular')}>{formatMoney(o.total)}</td>
              </tr>
            ))}
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.82rem] text-subtle">
            <span>{data.totalCount} orders</span>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => set({ page: String(p) })} />
          </div>
        </div>
      )}
    </div>
  )
}
