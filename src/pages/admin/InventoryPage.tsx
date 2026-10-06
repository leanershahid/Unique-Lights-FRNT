import { Boxes, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchBox, Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Tabs } from '@/components/ui/Tabs'
import { useAdminInventory, useUpdateInventory } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { InventoryItemDto } from '@/types/api'
import { cn } from '@/utils/cn'

function StockEditor({ item }: { item: InventoryItemDto }) {
  const update = useUpdateInventory()
  const [onHand, setOnHand] = useState(String(item.quantityOnHand))
  const [threshold, setThreshold] = useState(String(item.lowStockThreshold))
  useEffect(() => {
    setOnHand(String(item.quantityOnHand))
    setThreshold(String(item.lowStockThreshold))
  }, [item.quantityOnHand, item.lowStockThreshold])
  const dirty = Number(onHand) !== item.quantityOnHand || Number(threshold) !== item.lowStockThreshold
  const valid = Number.isInteger(Number(onHand)) && Number(onHand) >= item.reservedQuantity && Number(threshold) >= 0

  const adjust = (delta: number) => update.mutate({ variantId: item.variantId, body: { adjustment: delta } })

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={() => adjust(-1)} disabled={item.quantityOnHand <= item.reservedQuantity || update.isPending} className="flex size-8 items-center justify-center rounded-full border border-line hover:border-brass disabled:opacity-30" aria-label="Remove one unit">
        <Minus size={14} />
      </button>
      <input type="number" min={item.reservedQuantity} value={onHand} onChange={(e) => setOnHand(e.target.value)} aria-label={`On hand for ${item.sku}`} className="h-8 w-16 rounded-lg border border-line bg-bg text-center font-mono text-[0.85rem] outline-none focus:border-brass" />
      <button type="button" onClick={() => adjust(1)} disabled={update.isPending} className="flex size-8 items-center justify-center rounded-full border border-line hover:border-brass disabled:opacity-30" aria-label="Add one unit">
        <Plus size={14} />
      </button>
      <input type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} aria-label={`Low-stock threshold for ${item.sku}`} title="Low-stock alert at" className="ml-2 h-8 w-14 rounded-lg border border-line bg-bg text-center font-mono text-[0.8rem] text-muted outline-none focus:border-brass" />
      <Button size="sm" variant="outline" className={cn('ml-1 !h-8 transition-opacity', dirty ? 'opacity-100' : 'pointer-events-none opacity-0')} disabled={!valid} loading={update.isPending} onClick={() => update.mutate({ variantId: item.variantId, body: { quantityOnHand: Number(onHand), lowStockThreshold: Number(threshold) } })}>
        Save
      </Button>
    </div>
  )
}

export default function InventoryPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const lowStockOnly = params.get('lowStockOnly') === 'true'
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminInventory({ search: search || undefined, lowStockOnly: lowStockOnly || undefined, page, pageSize: 20 })
  useEffect(() => {
    document.title = 'Inventory · Unique Lights Admin'
  }, [])
  const set = (patch: Record<string, string | undefined>) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
      if (!('page' in patch)) next.delete('page')
      return next
    })

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Stock on hand for every variant. Reserved units are held by unshipped orders." />
      <div className="mb-4">
        <SearchBox value={search} onChange={(v) => set({ search: v })} placeholder="Search product or SKU" />
      </div>
      <Tabs
        className="mb-4"
        value={lowStockOnly ? 'low' : 'all'}
        onChange={(v) => set({ lowStockOnly: v === 'low' ? 'true' : undefined })}
        items={[
          { value: 'all', label: 'All variants' },
          { value: 'low', label: 'Low stock' },
        ]}
      />
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data.items.length ? (
        <EmptyState icon={<Boxes size={30} />} title={lowStockOnly ? 'Nothing is running low' : 'No variants found'} />
      ) : (
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <Table
            head={
              <tr>
                <th className={th}>Variant</th>
                <th className={th}>SKU</th>
                <th className={cn(th, 'text-right')}>Reserved</th>
                <th className={cn(th, 'text-right')}>Available</th>
                <th className={cn(th, 'text-right')}>On hand · Alert at</th>
              </tr>
            }
          >
            {data.items.map((i) => (
              <tr key={i.variantId}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    {i.imageUrl ? <img src={i.imageUrl} alt="" className="size-10 rounded-lg object-cover" /> : <span className="size-10 rounded-lg bg-surface-2" />}
                    <div>
                      <Link to={`/admin/products/${i.productId}`} className="font-medium hover:text-brass">
                        {i.productName}
                      </Link>
                      <p className="text-[0.78rem] text-subtle">{i.variantName}</p>
                    </div>
                  </div>
                </td>
                <td className={cn(td, 'font-mono text-[0.8rem]')}>{i.sku}</td>
                <td className={cn(td, 'text-right font-mono tabular text-muted')}>{i.reservedQuantity}</td>
                <td className={cn(td, 'text-right')}>
                  {i.available === 0 ? <Badge tone="danger">Out · 0</Badge> : i.isLowStock ? <Badge tone="warning">Low · {i.available}</Badge> : <span className="font-mono tabular">{i.available}</span>}
                </td>
                <td className={td}>
                  <StockEditor item={i} />
                </td>
              </tr>
            ))}
          </Table>
          <Pagination className="mt-4" page={data.page} totalPages={data.totalPages} onChange={(p) => set({ page: String(p) })} />
        </div>
      )}
    </div>
  )
}
