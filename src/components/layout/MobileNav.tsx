import { ChevronDown, Heart, LayoutDashboard, LogOut, Moon, Package, Sun, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { collapse, staggerContainer, staggerItem } from '@/animations/variants'
import { LinkButton } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Overlay'
import { useLogout } from '@/features/auth/hooks'
import { useCategories } from '@/features/categories/hooks'
import { selectIsAdmin, selectIsAuthenticated, useAppDispatch, useAppSelector } from '@/store/hooks'
import { themeToggled } from '@/store/slices/preferencesSlice'
import { setMobileNavOpen } from '@/store/slices/uiSlice'
import { cn } from '@/utils/cn'
import { Logo } from './Logo'

export function MobileNav() {
  const open = useAppSelector((s) => s.ui.mobileNavOpen)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isAdmin = useAppSelector(selectIsAdmin)
  const user = useAppSelector((s) => s.auth.user)
  const theme = useAppSelector((s) => s.preferences.theme)
  const dispatch = useAppDispatch()
  const { data: categories } = useCategories()
  const logout = useLogout()
  const location = useLocation()
  const [expanded, setExpanded] = useState<string | null>(null)
  const close = () => dispatch(setMobileNavOpen(false))

  useEffect(() => {
    close()
  }, [location.pathname, location.search])

  const row = 'flex min-h-14 w-full items-center justify-between border-b border-line text-left font-display text-[1.3rem] text-ink'
  const sub = 'flex min-h-12 items-center gap-3 text-[0.95rem] text-muted transition-colors hover:text-ink'

  return (
    <Drawer open={open} onClose={close} side="left" title={<Logo size="sm" />}>
      <motion.nav aria-label="Mobile" variants={staggerContainer(0.04, 0.12)} initial="hidden" animate="visible" className="flex min-h-full flex-col px-5 pb-8">
        {categories?.map((c) => {
          const isOpen = expanded === c.id
          return (
            <motion.div key={c.id} variants={staggerItem}>
              {c.children.length > 0 ? (
                <>
                  <button type="button" className={row} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : c.id)}>
                    {c.name}
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown size={20} className="text-subtle" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.ul variants={collapse} initial="hidden" animate="visible" exit="exit" className="overflow-hidden pl-3">
                        <li>
                          <Link to={`/categories/${c.slug}`} className={sub}>
                            All {c.name.toLowerCase()}
                          </Link>
                        </li>
                        {c.children.map((child) => (
                          <li key={child.id}>
                            <Link to={`/categories/${child.slug}`} className={sub}>
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to={`/categories/${c.slug}`} className={row}>
                  {c.name}
                  <span className="font-mono text-[0.75rem] text-subtle">{c.productCount}</span>
                </Link>
              )}
            </motion.div>
          )
        })}
        <motion.div variants={staggerItem}>
          <Link to="/products" className={cn(row, 'text-brass')}>
            All lighting
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-6 grid gap-1">
          {isAuthenticated ? (
            <>
              <p className="mb-2 text-[0.85rem] text-subtle">Signed in as {user?.firstName}</p>
              <Link to="/account" className={sub}>
                <User size={18} /> My account
              </Link>
              <Link to="/account/orders" className={sub}>
                <Package size={18} /> Orders
              </Link>
              <Link to="/account/wishlist" className={sub}>
                <Heart size={18} /> Wishlist
              </Link>
              {isAdmin && (
                <Link to="/admin" className={sub}>
                  <LayoutDashboard size={18} /> Admin dashboard
                </Link>
              )}
              <button type="button" className={sub} onClick={() => logout.mutate()}>
                <LogOut size={18} /> Sign out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <LinkButton to="/login" variant="outline">
                Sign in
              </LinkButton>
              <LinkButton to="/register" variant="accent">
                Create account
              </LinkButton>
            </div>
          )}
          <button type="button" className={cn(sub, 'mt-3')} onClick={() => dispatch(themeToggled())}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Daylight theme' : 'Evening theme'}
          </button>
        </motion.div>
      </motion.nav>
    </Drawer>
  )
}
