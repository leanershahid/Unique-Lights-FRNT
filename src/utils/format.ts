import type { OrderStatus, PaymentMethod } from '@/types/api'

const currency = import.meta.env.VITE_CURRENCY || 'INR'
const locale = import.meta.env.VITE_LOCALE || 'en-IN'

const priceFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 })
const exactPriceFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })
const numberFormatter = new Intl.NumberFormat(locale)

/** Whole-unit price for product cards (₹12,499). */
export const formatPrice = (value: number) => priceFormatter.format(value)
/** Exact price for carts, invoices and totals (₹12,499.00). */
export const formatMoney = (value: number) => exactPriceFormatter.format(value)
export const formatNumber = (value: number) => numberFormatter.format(value)

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale, opts)
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  Pending: 'Placed',
  Confirmed: 'Confirmed',
  Processing: 'Packing',
  Shipped: 'Shipped',
  OutForDelivery: 'Out for delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
}

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  CashOnDelivery: 'Cash on delivery',
  Card: 'Credit / debit card',
  Upi: 'UPI',
}

export function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || 'UL'
}
