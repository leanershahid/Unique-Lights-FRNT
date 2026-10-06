import type { ReactNode } from 'react'
import type { OrderStatus } from '@/types/api'
import { orderStatusLabel } from '@/utils/format'
import { cn } from '@/utils/cn'

type Tone = 'neutral' | 'brass' | 'success' | 'danger' | 'warning' | 'solid'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  brass: 'bg-brass/15 text-brass',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
  solid: 'bg-brass text-on-brass',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wide', tones[tone], className)}>
      {children}
    </span>
  )
}

const statusTone: Record<OrderStatus, Tone> = {
  Pending: 'warning',
  Confirmed: 'brass',
  Processing: 'brass',
  Shipped: 'brass',
  OutForDelivery: 'brass',
  Delivered: 'success',
  Cancelled: 'danger',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={statusTone[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {orderStatusLabel[status]}
    </Badge>
  )
}
