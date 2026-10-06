import { ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { dropdown, staggerContainer, staggerItem } from '@/animations/variants'
import { useCategories } from '@/features/categories/hooks'
import { useAppSelector } from '@/store/hooks'
import type { CategoryDto } from '@/types/api'
import { cn } from '@/utils/cn'

/** Desktop "Shop" menu: category list on the left, a live preview of the hovered category on the right. */
export function MegaMenu({ onDark }: { onDark: boolean }) {
  const { data: categories } = useCategories()
  // Re-declare theme tokens on the panel: the header overrides text colours while it sits over the hero.
  const theme = useAppSelector((s) => s.preferences.theme)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<CategoryDto | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const show = () => {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140)
  }
  const preview = active ?? categories?.[0] ?? null

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={cn('relative py-2 text-[0.9rem] transition-colors hover:text-ink', onDark ? 'text-ink/85' : 'text-muted', open && 'text-ink')}
      >
        Shop
        <span className={cn('absolute inset-x-0 -bottom-0.5 h-px origin-left bg-brass transition-transform duration-300', open ? 'scale-x-100' : 'scale-x-0')} />
      </button>

      <AnimatePresence>
        {open && categories && (
          <motion.div
            data-theme={theme}
            variants={dropdown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass absolute left-1/2 top-full z-50 mt-4 w-[min(860px,calc(100vw-48px))] -translate-x-1/2 overflow-hidden rounded-3xl border border-line shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)]"
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <motion.ul variants={staggerContainer(0.03)} initial="hidden" animate="visible" className="grid gap-0.5 p-4">
                {categories.map((c) => (
                  <motion.li key={c.id} variants={staggerItem}>
                    <Link
                      to={`/categories/${c.slug}`}
                      onMouseEnter={() => setActive(c)}
                      onFocus={() => setActive(c)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors',
                        preview?.id === c.id ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
                      )}
                    >
                      <span className="font-display text-[1.1rem]">{c.name}</span>
                      <span className="font-mono text-[0.72rem] text-subtle">{c.productCount}</span>
                    </Link>
                  </motion.li>
                ))}
                <li className="mt-2 border-t border-line px-4 pt-3">
                  <Link to="/products" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 text-[0.88rem] font-semibold text-brass hover:gap-3 transition-[gap]">
                    View all lighting <ArrowRight size={15} />
                  </Link>
                </li>
              </motion.ul>

              <div className="relative min-h-[340px] overflow-hidden border-l border-line">
                <AnimatePresence mode="popLayout" initial={false}>
                  {preview && (
                    <motion.div
                      key={preview.id}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0"
                    >
                      {preview.imageUrl && <img src={preview.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-[#f4ece1]">
                        <p className="font-display text-[1.6rem]">{preview.name}</p>
                        {preview.description && <p className="mt-1 line-clamp-2 text-[0.88rem] text-[#e3d8ca]">{preview.description}</p>}
                        {preview.children.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {preview.children.map((child) => (
                              <NavLink key={child.id} to={`/categories/${child.slug}`} onClick={() => setOpen(false)} className="rounded-full border border-white/30 px-3 py-1 text-[0.78rem] hover:border-white">
                                {child.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
