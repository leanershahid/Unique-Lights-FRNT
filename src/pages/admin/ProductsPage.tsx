import { Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SearchBox, Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { IconButton, LinkButton } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Overlay'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { useAdminCategories, useAdminProducts, useDeleteProduct } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { AdminProductListItemDto } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDate, formatPrice } from '@/utils/format'

type Status = 'all' | 'active' | 'inactive'

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const search = params.get('search') ?? ''
  const status = (params.get('status') as Status | null) ?? 'all'
  const categoryId = params.get('categoryId') ?? ''
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminProducts({ search: search || undefined, status, categoryId: categoryId || undefined, page, pageSize: 15 })
  const categories = useAdminCategories()
  const remove = useDeleteProduct()
  const [deleting, setDeleting] = useState<AdminProductListItemDto | null>(null)

  useEffect(() => {
    document.title = 'Products · Unique Lights Admin'
  }, [])

  const set = (patch: Record<string, string | number | undefined>) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => (v === undefined || v === '' || v === 'all' ? next.delete(k) : next.set(k, String(v))))
      if (!('page' in patch)) next.delete('page')
      return next
    })

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Catalogue, pricing and visibility."
        action={
          <LinkButton to="/admin/products/new" variant="accent">
            <Plus size={17} /> New product
          </LinkButton>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBox value={search} onChange={(v) => set({ search: v })} placeholder="Search name or SKU" />
        <select
          value={categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
          aria-label="Filter by category"
          className="h-10 rounded-full border border-line bg-surface px-4 text-[0.85rem] outline-none focus:border-brass"
        >
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Tabs<Status>
        className="mb-4"
        value={status}
        onChange={(v) => set({ status: v })}
        items={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Hidden' },
        ]}
      />

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={<Package size={30} />} title="No products found" description={search ? 'Try a different search.' : 'Create your first product to start selling.'} />
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <Table
            head={
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Category</th>
                <th className={cn(th, 'text-right')}>Price</th>
                <th className={cn(th, 'text-right')}>Stock</th>
                <th className={th}>Status</th>
                <th className={th}>Updated</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            }
          >
            {data.items.map((p) => (
              <tr key={p.id} className="cursor-pointer transition-colors hover:bg-surface-2/60" onClick={() => navigate(`/admin/products/${p.id}`)}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    {p.primaryImageUrl ? <img src={p.primaryImageUrl} alt="" className="size-11 rounded-lg object-cover" /> : <span className="size-11 rounded-lg bg-surface-2" />}
                    <div className="min-w-0">
                      <Link to={`/admin/products/${p.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-brass">
                        {p.name}
                      </Link>
                      <p className="font-mono text-[0.75rem] text-subtle">
                        {p.sku} · {p.variantCount} variant{p.variantCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={cn(td, 'text-muted')}>{p.categoryName}</td>
                <td className={cn(td, 'text-right font-mono tabular')}>
                  {formatPrice(p.price)}
                  {p.compareAtPrice && p.compareAtPrice > p.price && <span className="block text-[0.75rem] text-subtle line-through">{formatPrice(p.compareAtPrice)}</span>}
                </td>
                <td className={cn(td, 'text-right font-mono tabular', p.totalStock === 0 ? 'text-danger' : p.totalStock <= 5 ? 'text-warning' : '')}>{p.totalStock}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Hidden'}</Badge>
                    {p.isFeatured && <Badge tone="brass">Featured</Badge>}
                    {p.isNew && <Badge>New</Badge>}
                  </div>
                </td>
                <td className={cn(td, 'text-muted')}>{formatDate(p.updatedAt, { day: 'numeric', month: 'short' })}</td>
                <td className={cn(td, 'text-right')} onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">
                    <IconButton label={`Edit ${p.name}`} size="sm" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton label={`Delete ${p.name}`} size="sm" className="hover:!text-danger" onClick={() => setDeleting(p)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.82rem] text-subtle">
            <span>
              {data.totalCount} product{data.totalCount === 1 ? '' : 's'}
            </span>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => set({ page: p })} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title={`Delete ${deleting?.name ?? 'product'}?`}
        message="It will disappear from the store immediately. Past orders keep their records."
        confirmLabel="Delete product"
      />
    </div>
  )
}
