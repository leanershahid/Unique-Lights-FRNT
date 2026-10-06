import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useAdminCustomer, useSetCustomerStatus } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import { useAppSelector } from '@/store/hooks'
import { formatDate, formatMoney } from '@/utils/format'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const me = useAppSelector((s) => s.auth.user)
  const { data: c, isPending, isError, error, refetch } = useAdminCustomer(id)
  const setStatus = useSetCustomerStatus()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    document.title = 'Customer · Unique Lights Admin'
  }, [])

  return (
    <div>
      <Link to="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] text-muted hover:text-ink">
        <ChevronLeft size={16} /> Customers
      </Link>
      {isPending ? (
        <Skeleton className="h-96" />
      ) : isError || !c ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <AdminPageHeader
            title={`${c.firstName} ${c.lastName}`}
            description={c.email}
            action={
              c.id !== me?.id && (
                <Button variant={c.isActive ? 'danger' : 'outline'} onClick={() => (c.isActive ? setConfirming(true) : setStatus.mutate({ id: c.id, isActive: true }))} loading={setStatus.isPending}>
                  {c.isActive ? 'Deactivate account' : 'Reactivate account'}
                </Button>
              )
            }
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="grid h-fit gap-6">
              <Card className="grid gap-3 p-5 text-[0.9rem]">
                {[
                  ['Status', c.isActive ? 'Active' : 'Deactivated'],
                  ['Phone', c.phone ?? '—'],
                  ['Joined', formatDate(c.createdAt)],
                  ['Orders', String(c.ordersCount)],
                  ['Lifetime spend', formatMoney(c.totalSpent)],
                  ['Last order', formatDate(c.lastOrderAt)],
                  ['Roles', c.roles.join(', ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-muted">{k}</span>
                    <span className="text-right">{v}</span>
                  </div>
                ))}
              </Card>
              <Card className="p-5">
                <p className="eyebrow mb-3">Addresses</p>
                {c.addresses.length ? (
                  <ul className="grid gap-3 text-[0.88rem] text-muted">
                    {c.addresses.map((a) => (
                      <li key={a.id}>
                        <b className="font-semibold text-ink">{a.fullName}</b> {a.isDefault && <span className="text-brass">· Default</span>}
                        <br />
                        {a.line1}, {a.city}, {a.state} {a.postalCode}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[0.88rem] text-muted">No saved addresses.</p>
                )}
              </Card>
            </div>
            <Card className="p-5">
              <p className="eyebrow mb-3">Recent orders</p>
              {c.recentOrders.length ? (
                <ul className="divide-y divide-line">
                  {c.recentOrders.map((o) => (
                    <li key={o.id}>
                      <Link to={`/admin/orders/${o.orderNumber}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-brass">
                        <span className="w-28 font-mono">#{o.orderNumber}</span>
                        <span className="flex-1 text-[0.85rem] text-muted">{formatDate(o.placedAt)}</span>
                        <OrderStatusBadge status={o.status} />
                        <span className="w-28 text-right font-mono tabular">{formatMoney(o.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-muted">No orders yet.</p>
              )}
            </Card>
          </div>
          <ConfirmDialog
            open={confirming}
            onClose={() => setConfirming(false)}
            onConfirm={() => setStatus.mutate({ id: c.id, isActive: false }, { onSettled: () => setConfirming(false) })}
            loading={setStatus.isPending}
            danger
            title="Deactivate this account?"
            message={`${c.firstName} will be signed out and unable to sign in until you reactivate the account. Their orders are kept.`}
            confirmLabel="Deactivate"
          />
        </>
      )}
    </div>
  )
}
