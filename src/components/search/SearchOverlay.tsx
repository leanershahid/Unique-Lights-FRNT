import { ArrowUpRight, Clock, Search, TrendingUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { staggerContainer, staggerItem } from '@/animations/variants'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/features/categories/hooks'
import { useSearchSuggestions } from '@/features/products/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { recentSearchAdded, recentSearchesCleared } from '@/store/slices/preferencesSlice'
import { setSearchOpen } from '@/store/slices/uiSlice'
import { formatPrice } from '@/utils/format'

const POPULAR = ['Brass pendant', 'Crystal chandelier', 'Wall sconce', 'Floor lamp', 'Warm white 2700K']

/** Full-width search panel: expands from the top, dims the page, focuses the field, shows suggestions as you type. */
export function SearchOverlay() {
  const open = useAppSelector((s) => s.ui.searchOpen)
  const recent = useAppSelector((s) => s.preferences.recentSearches)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 220)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, isFetching } = useSearchSuggestions(debounced)
  const { data: categories } = useCategories()
  useLockBodyScroll(open)

  const close = () => dispatch(setSearchOpen(false))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (e.key === '/' && !typing && !open) {
        e.preventDefault()
        dispatch(setSearchOpen(true))
      }
      if (e.key === 'Escape' && open) close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 60)
    else setTerm('')
  }, [open])

  const submit = (value: string) => {
    const q = value.trim()
    if (!q) return
    dispatch(recentSearchAdded(q))
    close()
    navigate(`/products?search=${encodeURIComponent(q)}`)
  }

  const showResults = debounced.trim().length >= 2
  const chip = 'inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[0.85rem] text-muted transition-colors hover:border-brass hover:text-ink'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-overlay backdrop-blur-md" onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: -30, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[100dvh] overflow-y-auto border-b border-line bg-surface pt-[env(safe-area-inset-top)] shadow-2xl"
          >
            <div className="container-page py-5 sm:py-8">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault()
                  submit(term)
                }}
                className="flex items-center gap-3 border-b border-line-strong pb-3 focus-within:border-brass"
              >
                <Search size={24} className="shrink-0 text-brass" />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search pendants, chandeliers, finishes…"
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.4rem,4vw,2.4rem)] text-ink outline-none placeholder:text-subtle"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {isFetching && <span className="size-2 animate-ping rounded-full bg-brass" aria-hidden="true" />}
                <button type="button" onClick={close} aria-label="Close search" className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
                  <X size={22} />
                </button>
              </form>

              <div className="mt-6 min-h-[200px]">
                <AnimatePresence mode="wait">
                  {showResults ? (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
                      <div>
                        <p className="eyebrow mb-3">Products</p>
                        {!data && isFetching ? (
                          <div className="grid gap-3">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="flex items-center gap-4">
                                <Skeleton className="size-16 shrink-0 rounded-lg" />
                                <div className="grid flex-1 gap-2">
                                  <Skeleton className="h-4 w-2/3" />
                                  <Skeleton className="h-3 w-1/4" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : data && data.products.length > 0 ? (
                          <motion.ul variants={staggerContainer(0.04)} initial="hidden" animate="visible" className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {data.products.map((p) => (
                              <motion.li key={p.id} variants={staggerItem}>
                                <Link to={`/products/${p.slug}`} onClick={close} className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-surface-2">
                                  <img src={p.primaryImage?.url} alt="" className="size-16 shrink-0 rounded-lg object-cover" loading="lazy" />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-display text-[1.05rem] text-ink group-hover:text-brass">{p.name}</span>
                                    <span className="text-[0.82rem] text-muted">
                                      {p.categoryName} · {formatPrice(p.price)}
                                    </span>
                                  </span>
                                  <ArrowUpRight size={16} className="text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        ) : (
                          <p className="py-6 text-muted">No lights match “{debounced}”. Try a finish like brass, or a room like kitchen.</p>
                        )}
                        {data && data.products.length > 0 && (
                          <button type="button" onClick={() => submit(term)} className="mt-4 text-[0.9rem] font-semibold text-brass hover:underline">
                            See all results for “{term.trim()}”
                          </button>
                        )}
                      </div>
                      {data && data.categories.length > 0 && (
                        <div>
                          <p className="eyebrow mb-3">Categories</p>
                          <ul className="grid gap-1">
                            {data.categories.map((c) => (
                              <li key={c.id}>
                                <Link to={`/categories/${c.slug}`} onClick={close} className="block rounded-lg px-3 py-2 text-ink transition-colors hover:bg-surface-2 hover:text-brass">
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="idle" variants={staggerContainer(0.06)} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-1 gap-8 md:grid-cols-3">
                      {recent.length > 0 && (
                        <motion.div variants={staggerItem}>
                          <div className="mb-3 flex items-center justify-between">
                            <p className="eyebrow">Recent</p>
                            <button type="button" className="text-[0.78rem] text-subtle hover:text-ink" onClick={() => dispatch(recentSearchesCleared())}>
                              Clear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recent.map((r) => (
                              <button key={r} type="button" className={chip} onClick={() => submit(r)}>
                                <Clock size={13} /> {r}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      <motion.div variants={staggerItem}>
                        <p className="eyebrow mb-3">Popular</p>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR.map((r) => (
                            <button key={r} type="button" className={chip} onClick={() => submit(r)}>
                              <TrendingUp size={13} /> {r}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <p className="eyebrow mb-3">Browse</p>
                        <div className="flex flex-wrap gap-2">
                          {categories?.map((c) => (
                            <Link key={c.id} to={`/categories/${c.slug}`} onClick={close} className={chip}>
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
