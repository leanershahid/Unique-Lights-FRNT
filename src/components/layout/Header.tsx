import { Heart, LayoutDashboard, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sun, User } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CART_ANCHOR_ID } from '@/animations/flyToCart'
import { dropdown } from '@/animations/variants'
import { IconButton } from '@/components/ui/Button'
import { useLogout } from '@/features/auth/hooks'
import { useCart } from '@/features/cart/hooks'
import { useWishlist } from '@/features/wishlist/hooks'
import { selectIsAdmin, selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store/hooks'
import { themeToggled } from '@/store/slices/preferencesSlice'
import { setCartOpen, setMobileNavOpen, setSearchOpen } from '@/store/slices/uiSlice'
import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'
import { Logo } from './Logo'
import { MegaMenu } from './MegaMenu'

function CountBadge({ count, pulse }: { count: number; pulse: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={`${count}-${pulse}`}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [1.45, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brass px-1 font-mono text-[0.65rem] font-medium text-on-brass tabular"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function AccountMenu() {
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = useAppSelector(selectIsAdmin)
  const logout = useLogout()
  const theme = useAppSelector((s) => s.preferences.theme)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const item = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] text-muted transition-colors hover:bg-surface-2 hover:text-ink'
  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex size-10 items-center justify-center rounded-full bg-surface-2 font-mono text-[0.78rem] font-medium text-brass ring-1 ring-line transition hover:ring-brass"
      >
        {initials(user.firstName, user.lastName)}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div data-theme={theme} variants={dropdown} initial="hidden" animate="visible" exit="exit" role="menu" className="glass absolute right-0 top-full z-50 mt-3 w-64 rounded-2xl border border-line p-2 shadow-2xl">
            <div className="px-3 pb-2 pt-1.5">
              <p className="font-semibold text-ink">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[0.8rem] text-subtle">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)}>
              <User size={16} /> My account
            </Link>
            <Link role="menuitem" to="/account/orders" className={item} onClick={() => setOpen(false)}>
              <Package size={16} /> Orders
            </Link>
            <Link role="menuitem" to="/account/wishlist" className={item} onClick={() => setOpen(false)}>
              <Heart size={16} /> Wishlist
            </Link>
            {isAdmin && (
              <Link role="menuitem" to="/admin" className={item} onClick={() => setOpen(false)}>
                <LayoutDashboard size={16} /> Admin dashboard
              </Link>
            )}
            <div className="my-1 h-px bg-line" />
            <button role="menuitem" type="button" className={cn(item, 'w-full')} onClick={() => logout.mutate()}>
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const navLinks = [
  { to: '/products?isNew=true', label: 'New in' },
  { to: '/categories/pendant-lights', label: 'Pendants' },
  { to: '/categories/chandeliers', label: 'Chandeliers' },
  { to: '/products?sort=price_desc&featured=true', label: 'Collections' },
]

/**
 * Transparent over the home hero, frosted glass once the page scrolls.
 */
export function Header({ overlay = false }: { overlay?: boolean }) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const theme = useAppSelector((s) => s.preferences.theme)
  const { cartPulse, wishlistPulse } = useAppSelector((s) => s.ui)
  const { cart } = useCart()
  const { data: wishlist } = useWishlist()
  const location = useLocation()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide on fast scroll down, reveal on scroll up.
    setHidden(y > 400 && y > prev + 4)
    if (y < prev - 4) setHidden(false)
  })

  useEffect(() => setHidden(false), [location.pathname])

  const solid = !overlay || scrolled
  const onDark = overlay && !scrolled

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300',
        solid ? 'glass border-b border-line' : 'border-b border-transparent',
        onDark && '[--ul-ink:#f4ece1] [--ul-muted:#d8ccbe] [color:#f4ece1]',
      )}
    >
      <div className={cn('container-page flex items-center gap-2 transition-[height] duration-300 sm:gap-4', solid ? 'h-16' : 'h-20')}>
        <IconButton label="Open menu" className="-ml-2 lg:hidden" onClick={() => dispatch(setMobileNavOpen(true))}>
          <Menu size={22} />
        </IconButton>

        <Logo tone={onDark ? 'onDark' : 'auto'} />

        <nav aria-label="Main" className="ml-8 hidden items-center gap-7 lg:flex">
          <MegaMenu onDark={onDark} />
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'group relative py-2 text-[0.9rem] transition-colors hover:text-ink',
                  // NavLink ignores the query string, so links like /products?isNew=true also compare it.
                  isActive && location.search === (l.to.split('?')[1] ? `?${l.to.split('?')[1]}` : location.search)
                    ? 'text-ink'
                    : onDark
                      ? 'text-ink/85'
                      : 'text-muted',
                )
              }
            >
              {l.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-brass transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => dispatch(setSearchOpen(true))}
            className="mr-1 hidden h-10 w-56 items-center gap-2.5 rounded-full border border-line bg-surface/40 px-4 text-[0.85rem] text-subtle transition-colors hover:border-brass hover:text-ink xl:flex"
            aria-label="Search products"
          >
            <Search size={16} /> Search lights…
            <kbd className="ml-auto rounded border border-line px-1.5 font-mono text-[0.65rem]">/</kbd>
          </button>
          <IconButton label="Search" className="xl:hidden" onClick={() => dispatch(setSearchOpen(true))}>
            <Search size={20} />
          </IconButton>
          <IconButton label={theme === 'dark' ? 'Switch to daylight theme' : 'Switch to evening theme'} className="max-sm:hidden" onClick={() => dispatch(themeToggled())}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              </motion.span>
            </AnimatePresence>
          </IconButton>
          {isAuthenticated && (
            <Link to="/account/wishlist" aria-label="Wishlist" className="relative hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-surface-2 hover:text-brass sm:inline-flex">
              <motion.span key={wishlistPulse} animate={wishlistPulse ? { scale: [1, 1.3, 1] } : undefined} transition={{ duration: 0.35 }}>
                <Heart size={20} />
              </motion.span>
              <CountBadge count={wishlist?.items.length ?? 0} pulse={wishlistPulse} />
            </Link>
          )}
          <IconButton
            id={CART_ANCHOR_ID}
            label={`Cart, ${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}`}
            onClick={() => dispatch(setCartOpen(true))}
            badge={<CountBadge count={cart.itemCount} pulse={cartPulse} />}
          >
            <motion.span key={cartPulse} animate={cartPulse ? { y: [0, -5, 0], rotate: [0, -10, 8, 0] } : undefined} transition={{ duration: 0.45 }}>
              <ShoppingBag size={20} />
            </motion.span>
          </IconButton>
          {/* On phones the account links live in the menu drawer, which keeps the bar within 320 px. */}
          <div className="ml-1 max-sm:hidden">
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <Link to="/login" state={{ from: location.pathname + location.search }} className="hidden h-10 items-center rounded-full border border-line-strong px-4 text-[0.85rem] font-semibold transition-colors hover:border-brass hover:text-brass sm:inline-flex">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
