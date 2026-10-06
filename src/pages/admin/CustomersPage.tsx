import { Users } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchBox, Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useAdminCustomers } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import { cn } from '@/utils/cn'
import { formatDate, formatMoney, initials } from '@/utils/format'

export default function CustomersPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const search = params.get('search') ?? ''
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminCustomers({ search: search || undefined, page, pageSize: 20 })
  useEffect(() => {
    document.title = 'Customers · Unique Lights Admin'
  }, [])

  return (
    <div>
      <AdminPageHeader title="Customers" description="Accounts, lifetime spend and status." />
      <div className="mb-4">
        <SearchBox value={search} onChange={(v) => setParams(v ? { search: v } : {})} placeholder="Name, email or phone" />
      </div>
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data.items.length ? (
        <EmptyState icon={<Users size={30} />} title="No customers found" />
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <Table
            head={
              <tr>
                <th className={th}>Customer</th>
                <th className={th}>Phone</th>
                <th className={cn(th, 'text-right')}>Orders</th>
                <th className={cn(th, 'text-right')}>Spent</th>
                <th className={th}>Joined</th>
                <th className={th}>Status</th>
              </tr>
            }
          >
            {data.items.map((c) => (
              <tr key={c.id} tabIndex={0} onClick={() => navigate(`/admin/customers/${c.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/customers/${c.id}`)} className="cursor-pointer transition-colors hover:bg-surface-2/60">
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brass/12 font-mono text-[0.75rem] text-brass">{initials(c.firstName, c.lastName)}</span>
                    <div>
                      <p className="font-medium">
                        {c.firstName} {c.lastName} {c.roles.includes('Admin') && <Badge tone="brass">Admin</Badge>}
                      </p>
                      <p className="text-[0.78rem] text-subtle">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className={cn(td, 'text-muted')}>{c.phone ?? '—'}</td>
                <td className={cn(td, 'text-right font-mono tabular')}>{c.ordersCount}</td>
                <td className={cn(td, 'text-right font-mono tabular')}>{formatMoney(c.totalSpent)}</td>
                <td className={cn(td, 'text-muted')}>{formatDate(c.createdAt)}</td>
                <td className={td}>
                  <Badge tone={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Deactivated'}</Badge>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination className="mt-4" page={data.page} totalPages={data.totalPages} onChange={(p) => setParams({ ...(search ? { search } : {}), page: String(p) })} />
        </div>
      )}
    </div>
  )
}
