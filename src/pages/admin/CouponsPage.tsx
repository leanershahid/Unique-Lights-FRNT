import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import { Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Choice'
import { Input, Select } from '@/components/ui/Field'
import { CopyButton } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Overlay'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useAdminCoupons, useDeleteCoupon, useSaveCoupon } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { CouponDto, DiscountType } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatDate, formatPrice } from '@/utils/format'
import { hasErrors, serverErrors, type Errors } from '@/utils/validation'

type Form = { code: string; description: string; discountType: DiscountType; value: string; minOrderAmount: string; maxDiscountAmount: string; startsAt: string; endsAt: string; usageLimit: string; isActive: boolean }

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')
const fromDateInput = (v: string, endOfDay = false) => (v ? new Date(`${v}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString() : null)

function CouponModal({ coupon, open, onClose }: { coupon: CouponDto | null; open: boolean; onClose: () => void }) {
  const save = useSaveCoupon()
  const init = (): Form =>
    coupon
      ? {
          code: coupon.code,
          description: coupon.description ?? '',
          discountType: coupon.discountType,
          value: String(coupon.value),
          minOrderAmount: coupon.minOrderAmount?.toString() ?? '',
          maxDiscountAmount: coupon.maxDiscountAmount?.toString() ?? '',
          startsAt: toDateInput(coupon.startsAt),
          endsAt: toDateInput(coupon.endsAt),
          usageLimit: coupon.usageLimit?.toString() ?? '',
          isActive: coupon.isActive,
        }
      : { code: '', description: '', discountType: 'Percentage', value: '', minOrderAmount: '', maxDiscountAmount: '', startsAt: '', endsAt: '', usageLimit: '', isActive: true }
  const [v, setV] = useState<Form>(init)
  const [errors, setErrors] = useState<Errors<Form>>({})
  useEffect(() => {
    if (open) {
      setV(init())
      setErrors({})
    }
  }, [open, coupon])
  const set = (k: keyof Form, value: string | boolean) => setV((s) => ({ ...s, [k]: value }))

  const submit = () => {
    const value = Number(v.value)
    const found: Errors<Form> = {
      code: !/^[A-Z0-9_-]{3,30}$/i.test(v.code.trim()) ? 'Use 3–30 letters, numbers, dashes or underscores.' : undefined,
      value: !(value > 0) ? 'Enter a value above zero.' : v.discountType === 'Percentage' && value > 90 ? 'Percentage discounts can be at most 90%.' : undefined,
      endsAt: v.startsAt && v.endsAt && v.endsAt < v.startsAt ? 'End date must be after the start date.' : undefined,
    }
    setErrors(found)
    if (hasErrors(found)) return
    const n = (s: string) => (s === '' ? null : Number(s))
    save.mutate(
      {
        id: coupon?.id,
        body: {
          code: v.code.trim().toUpperCase(),
          description: v.description.trim() || null,
          discountType: v.discountType,
          value,
          minOrderAmount: n(v.minOrderAmount),
          maxDiscountAmount: n(v.maxDiscountAmount),
          startsAt: fromDateInput(v.startsAt),
          endsAt: fromDateInput(v.endsAt, true),
          usageLimit: n(v.usageLimit),
          isActive: v.isActive,
        },
      },
      { onSuccess: onClose, onError: (err) => setErrors(serverErrors<Form>(err)) },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={coupon ? `Edit ${coupon.code}` : 'New coupon'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={submit} loading={save.isPending}>
            {coupon ? 'Save coupon' : 'Create coupon'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Code" value={v.code} onChange={(e) => set('code', e.target.value.toUpperCase())} error={errors.code} className="font-mono uppercase" data-autofocus />
        <Input label="Description" optional value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="10% off your first order" />
        <Select label="Discount type" value={v.discountType} onChange={(e) => set('discountType', e.target.value)}>
          <option value="Percentage">Percentage</option>
          <option value="FixedAmount">Fixed amount (₹)</option>
        </Select>
        <Input label={v.discountType === 'Percentage' ? 'Percent off' : 'Amount off (₹)'} type="number" min={0} value={v.value} onChange={(e) => set('value', e.target.value)} error={errors.value} />
        <Input label="Minimum order (₹)" optional type="number" min={0} value={v.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} />
        <Input label="Maximum discount (₹)" optional type="number" min={0} value={v.maxDiscountAmount} onChange={(e) => set('maxDiscountAmount', e.target.value)} hint="Caps percentage discounts." />
        <Input label="Starts" optional type="date" value={v.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
        <Input label="Ends" optional type="date" value={v.endsAt} onChange={(e) => set('endsAt', e.target.value)} error={errors.endsAt} />
        <Input label="Usage limit" optional type="number" min={1} value={v.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} hint="Total redemptions across all customers." />
        <div className="flex items-end">
          <Switch checked={v.isActive} onChange={(c) => set('isActive', c)} label="Active" />
        </div>
        {save.isError && !hasErrors(serverErrors(save.error)) && <p className="text-[0.85rem] text-danger sm:col-span-2">{getErrorMessage(save.error)}</p>}
      </div>
    </Modal>
  )
}

function couponState(c: CouponDto): { label: string; tone: 'success' | 'neutral' | 'warning' | 'danger' } {
  const now = Date.now()
  if (!c.isActive) return { label: 'Off', tone: 'neutral' }
  if (c.endsAt && new Date(c.endsAt).getTime() < now) return { label: 'Expired', tone: 'danger' }
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: 'Scheduled', tone: 'warning' }
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { label: 'Used up', tone: 'danger' }
  return { label: 'Live', tone: 'success' }
}

export default function CouponsPage() {
  const { data, isPending, isError, error, refetch } = useAdminCoupons()
  const remove = useDeleteCoupon()
  const [editing, setEditing] = useState<CouponDto | 'new' | null>(null)
  const [deleting, setDeleting] = useState<CouponDto | null>(null)
  useEffect(() => {
    document.title = 'Coupons · Unique Lights Admin'
  }, [])

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Discount codes customers can apply at checkout."
        action={
          <Button variant="accent" onClick={() => setEditing('new')}>
            <Plus size={17} /> New coupon
          </Button>
        }
      />
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data.length ? (
        <EmptyState icon={<Tag size={30} />} title="No coupons yet" action={<Button onClick={() => setEditing('new')}>Create a coupon</Button>} />
      ) : (
        <Table
          head={
            <tr>
              <th className={th}>Code</th>
              <th className={th}>Discount</th>
              <th className={th}>Conditions</th>
              <th className={cn(th, 'text-right')}>Used</th>
              <th className={th}>Status</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          }
        >
          {data.map((c) => {
            const state = couponState(c)
            return (
              <tr key={c.id} className="hover:bg-surface-2/60">
                <td className={td}>
                  <span className="flex items-center gap-1 font-mono font-medium">
                    {c.code} <CopyButton text={c.code} label={`Copy ${c.code}`} />
                  </span>
                  {c.description && <p className="text-[0.78rem] text-subtle">{c.description}</p>}
                </td>
                <td className={td}>{c.discountType === 'Percentage' ? `${c.value}%${c.maxDiscountAmount ? ` up to ${formatPrice(c.maxDiscountAmount)}` : ''}` : `${formatPrice(c.value)} off`}</td>
                <td className={cn(td, 'text-[0.82rem] text-muted')}>
                  {c.minOrderAmount ? `Min ${formatPrice(c.minOrderAmount)}` : 'No minimum'}
                  {c.endsAt && <span className="block">Until {formatDate(c.endsAt)}</span>}
                </td>
                <td className={cn(td, 'text-right font-mono tabular')}>
                  {c.usedCount}
                  {c.usageLimit !== null && <span className="text-subtle"> / {c.usageLimit}</span>}
                </td>
                <td className={td}>
                  <Badge tone={state.tone}>{state.label}</Badge>
                </td>
                <td className={cn(td, 'text-right')}>
                  <div className="flex justify-end">
                    <IconButton label={`Edit ${c.code}`} size="sm" onClick={() => setEditing(c)}>
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton label={`Delete ${c.code}`} size="sm" className="hover:!text-danger" onClick={() => setDeleting(c)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      )}
      <CouponModal coupon={editing === 'new' ? null : editing} open={editing !== null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title={`Delete ${deleting?.code ?? 'coupon'}?`}
        message="Customers will no longer be able to use this code. Orders that already used it are unaffected."
        confirmLabel="Delete coupon"
      />
    </div>
  )
}
