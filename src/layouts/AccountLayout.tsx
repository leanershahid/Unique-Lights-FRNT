import { Heart, MapPin, Package, User } from 'lucide-react'
import { motion } from 'motion/react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/utils/cn'

const links = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
]

export function AccountLayout() {
  const user = useAppSelector((s) => s.auth.user)
  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-8">
        <p className="eyebrow mb-2">My account</p>
        <h1 className="text-[clamp(2rem,4vw,3rem)]">Hello, {user?.firstName}</h1>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav aria-label="Account" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('relative flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-[0.92rem] transition-colors lg:rounded-xl', isActive ? 'text-ink' : 'text-muted hover:text-ink')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="account-nav" className="absolute inset-0 rounded-full bg-surface-2 lg:rounded-xl" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <Icon size={17} className={cn('relative', isActive && 'text-brass')} />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
