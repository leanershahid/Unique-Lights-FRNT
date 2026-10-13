import { AlertTriangle, IndianRupee, Package, Plus, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { KpiCard, useChartColors } from '@/components/admin/AdminKit'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { LinkButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Misc'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { useAdminDashboard } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { OrderStatus } from '@/types/api'
import { formatDate, formatMoney, formatNumber, formatPrice, orderStatusLabel } from '@/utils/format'

const compactInr = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${Math.round(n)}`)

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className={className}>
      <Card className="h-full p-5">
        <p className="font-display text-[1.2rem]">{title}</p>
        {subtitle && <p className="text-[0.8rem] text-subtle">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useAdminDashboard()
  const c = useChartColors()
  useEffect(() => {
    document.title = 'Dashboard · Unique Lights Admin'
  }, [])

  if (isPending)
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  const delta = data.revenuePrevious30Days > 0 ? ((data.revenueLast30Days - data.revenuePrevious30Days) / data.revenuePrevious30Days) * 100 : null
  const statusColors: Record<OrderStatus, string> = {
    Pending: c.warning,
    Confirmed: c.brass,
    Processing: c.brass,
    Shipped: c.muted,
    OutForDelivery: c.subtle,
    Delivered: c.success,
    Cancelled: c.danger,
  }
  const tooltipStyle = { background: c.surface, border: `1px solid ${c.line}`, borderRadius: 12, color: c.ink, fontSize: 13 }
  const salesData = data.salesByDay.map((d) => ({ ...d, label: formatDate(d.date, { day: 'numeric', month: 'short' }) }))
  const statusData = data.ordersByStatus.filter((s) => s.count > 0)

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="Sales, orders and stock at a glance."
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton to="/admin/products/new" variant="accent">
              <Plus size={17} /> Add product
            </LinkButton>
            <LinkButton to="/admin/orders" variant="outline">
              <ShoppingCart size={17} /> Orders
            </LinkButton>
            <LinkButton to="/admin/inventory" variant="outline">
              <Package size={17} /> Stock
            </LinkButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Revenue (30 days)" value={data.revenueLast30Days} format={formatPrice} icon={<IndianRupee size={17} />} delta={delta} />
        <KpiCard index={1} label="Orders" value={data.ordersCount} format={(n) => formatNumber(Math.round(n))} icon={<ShoppingCart size={17} />} />
        <KpiCard index={2} label="Average order" value={data.averageOrderValue} format={formatPrice} icon={<TrendingUp size={17} />} />
        <KpiCard index={3} label="Customers" value={data.customersCount} format={(n) => formatNumber(Math.round(n))} icon={<Users size={17} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Revenue" subtitle={`Last 30 days · ${formatPrice(data.totalRevenue)} all time`} className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={c.brass} stopOpacity={0.45} />
                    <stop offset="1" stopColor={c.brass} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: c.subtle, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tick={{ fill: c.subtle, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={compactInr} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatMoney(Number(v)), 'Revenue']} cursor={{ stroke: c.line }} />
                <Area type="monotone" dataKey="revenue" stroke={c.brass} strokeWidth={2} fill="url(#rev)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders by status">
          {statusData.length ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="status" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" animationDuration={900}>
                      {statusData.map((s) => (
                        <Cell key={s.status} fill={statusColors[s.status]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, orderStatusLabel[n as OrderStatus]]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.82rem]">
                {statusData.map((s) => (
                  <li key={s.status} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="size-2.5 rounded-full" style={{ background: statusColors[s.status] }} /> {orderStatusLabel[s.status]}
                    </span>
                    <span className="font-mono tabular">{s.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="py-16 text-center text-muted">No orders yet.</p>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Daily orders" subtitle="Last 30 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={c.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: c.subtle, fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={30} />
                <YAxis allowDecimals={false} tick={{ fill: c.subtle, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: c.line }} formatter={(v) => [v, 'Orders']} />
                <Bar dataKey="orders" fill={c.brass} radius={[4, 4, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top products" subtitle="By revenue">
          {data.topProducts.length ? (
            <ul className="grid gap-3">
              {data.topProducts.slice(0, 5).map((p) => {
                const max = data.topProducts[0]?.revenue || 1
                return (
                  <li key={p.productId} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="size-10 rounded-lg object-cover" /> : <span className="size-10 rounded-lg bg-surface-2" />}
                    <div className="min-w-0">
                      <div className="flex justify-between gap-2 text-[0.85rem]">
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-mono tabular text-muted">{formatPrice(p.revenue)}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                        <motion.div className="h-full rounded-full bg-brass" initial={{ width: 0 }} animate={{ width: `${(p.revenue / max) * 100}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                      </div>
                      <p className="mt-0.5 text-[0.75rem] text-subtle">{p.unitsSold} sold</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="py-16 text-center text-muted">Sales will appear here.</p>
          )}
        </ChartCard>

        <ChartCard title="Low stock" subtitle={`${data.lowStock.length} variant${data.lowStock.length === 1 ? '' : 's'} need attention`}>
          {data.lowStock.length ? (
            <ul className="grid gap-2.5">
              {data.lowStock.slice(0, 6).map((i) => (
                <li key={i.variantId} className="flex items-center gap-3 text-[0.85rem]">
                  <AlertTriangle size={15} className={i.available === 0 ? 'text-danger' : 'text-warning'} />
                  <span className="min-w-0 flex-1 truncate">
                    {i.productName} <span className="text-subtle">· {i.variantName}</span>
                  </span>
                  <span className={`font-mono tabular ${i.available === 0 ? 'text-danger' : 'text-warning'}`}>{i.available}</span>
                </li>
              ))}
              <li>
                <Link to="/admin/inventory?lowStockOnly=true" className="text-[0.82rem] font-semibold text-brass hover:underline">
                  Manage inventory
                </Link>
              </li>
            </ul>
          ) : (
            <p className="flex items-center gap-2 py-12 text-muted">
              <Package size={16} /> Every variant is above its threshold.
            </p>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Recent orders">
        {data.recentOrders.length ? (
          <ul className="divide-y divide-line">
            {data.recentOrders.map((o) => (
              <li key={o.id}>
                <Link to={`/admin/orders/${o.orderNumber}`} className="flex flex-wrap items-center gap-3 py-3 transition-colors hover:text-brass sm:flex-nowrap">
                  <span className="w-28 font-mono text-[0.88rem]">#{o.orderNumber}</span>
                  <span className="min-w-0 flex-1 truncate text-[0.88rem] text-muted">{o.customerName ?? o.customerEmail}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className="w-24 text-right text-[0.82rem] text-subtle">{formatDate(o.placedAt, { day: 'numeric', month: 'short' })}</span>
                  <span className="w-28 text-right font-mono tabular">{formatMoney(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-muted">No orders yet. They will show up here as soon as customers check out.</p>
        )}
      </ChartCard>
    </div>
  )
}
