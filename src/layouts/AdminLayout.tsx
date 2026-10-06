import { Boxes, LayoutDashboard, LogOut, Menu, Moon, Package, ShoppingCart, Store, Sun, Tag, Tags, Users, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { IconButton } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useLogout } from '@/features/auth/hooks'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { themeToggled } from '@/store/slices/preferencesSlice'
import { AnimatedOutlet } from '@/routes/AnimatedOutlet'
import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
]

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="grid gap-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => cn('relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] transition-colors', isActive ? 'text-ink' : 'text-muted hover:text-ink')}
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-surface-2" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <Icon size={18} className={cn('relative', isActive && 'text-brass')} />
              <span className="relative">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user)
  const theme = useAppSelector((s) => s.preferences.theme)
  const dispatch = useAppDispatch()
  const logout = useLogout()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  const footer = (
    <div className="grid gap-1 border-t border-line pt-4">
      <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] text-muted transition-colors hover:text-ink">
        <Store size={18} /> View store
      </Link>
      <button type="button" onClick={() => dispatch(themeToggled())} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] text-muted transition-colors hover:text-ink">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Daylight theme' : 'Evening theme'}
      </button>
      <button type="button" onClick={() => logout.mutate()} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] text-muted transition-colors hover:text-danger">
        <LogOut size={18} /> Sign out
      </button>
      <div className="mt-3 flex items-center gap-3 px-3.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-brass/15 font-mono text-[0.75rem] text-brass">{initials(user?.firstName, user?.lastName)}</span>
        <span className="min-w-0">
          <span className="block truncate text-[0.85rem] text-ink">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="block truncate text-[0.75rem] text-subtle">{user?.email}</span>
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface/50 p-5 lg:flex">
        <div>
          <Logo to="/admin" />
          <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-subtle">Admin</p>
        </div>
        <div className="flex-1">
          <SideNav />
        </div>
        {footer}
      </aside>

      <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <IconButton label="Open admin menu" onClick={() => setOpen(true)}>
          <Menu size={20} />
        </IconButton>
        <Logo to="/admin" size="sm" />
        <span className="w-11" />
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-surface p-5 pt-[max(1.25rem,env(safe-area-inset-top))]"
            >
              <div className="flex items-center justify-between">
                <Logo to="/admin" size="sm" />
                <IconButton label="Close menu" size="sm" onClick={() => setOpen(false)}>
                  <X size={18} />
                </IconButton>
              </div>
              <div className="flex-1">
                <SideNav onNavigate={() => setOpen(false)} />
              </div>
              {footer}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <AnimatedOutlet fallback={<TableSkeleton />} />
      </main>
    </div>
  )
}

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)]">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
