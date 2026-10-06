import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FilterPanel } from '@/components/product/FilterPanel'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/Overlay'
import { Pagination } from '@/components/ui/Pagination'
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useCategories, useCategory } from '@/features/categories/hooks'
import { useProductFilters, useProducts } from '@/features/products/hooks'
import { useListingFilters, type FilterState } from '@/features/products/useProductFilters'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilterSheetOpen } from '@/store/slices/uiSlice'
import type { ProductSort } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

const SORT_LABELS: Record<ProductSort, string> = {
  featured: 'Recommended',
  newest: 'Newest',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  rating: 'Top rated',
  name: 'Name A–Z',
}

function ActiveChips({ state, update, clearAll }: { state: FilterState; update: (p: Partial<FilterState>) => void; clearAll: () => void }) {
  const chips: { key: string; label: string; remove: () => void }[] = []
  if (state.search) chips.push({ key: 'search', label: `“${state.search}”`, remove: () => update({ search: '' }) })
  if (state.inStock) chips.push({ key: 'stock', label: 'In stock', remove: () => update({ inStock: false }) })
  if (state.isNew) chips.push({ key: 'new', label: 'New arrivals', remove: () => update({ isNew: false }) })
  if (state.featured) chips.push({ key: 'featured', label: 'Bestsellers', remove: () => update({ featured: false }) })
  if (state.minPrice !== undefined || state.maxPrice !== undefined)
    chips.push({
      key: 'price',
      label: `${state.minPrice !== undefined ? formatPrice(state.minPrice) : 'Any'} – ${state.maxPrice !== undefined ? formatPrice(state.maxPrice) : 'Any'}`,
      remove: () => update({ minPrice: undefined, maxPrice: undefined }),
    })
  state.colorTemperatures.forEach((v) => chips.push({ key: `ct-${v}`, label: v, remove: () => update({ colorTemperatures: state.colorTemperatures.filter((x) => x !== v) }) }))
  state.finishes.forEach((v) => chips.push({ key: `f-${v}`, label: v, remove: () => update({ finishes: state.finishes.filter((x) => x !== v) }) }))
  state.brands.forEach((v) => chips.push({ key: `b-${v}`, label: v, remove: () => update({ brands: state.brands.filter((x) => x !== v) }) }))
  if (!chips.length) return null

  return (
    <motion.div layout className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {chips.map((c) => (
          <motion.button
            layout
            key={c.key}
            type="button"
            onClick={c.remove}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-1.5 pl-3 pr-2 text-[0.82rem] text-ink transition-colors hover:bg-brass/15"
            aria-label={`Remove filter ${c.label}`}
          >
            {c.label} <X size={13} />
          </motion.button>
        ))}
      </AnimatePresence>
      <button type="button" onClick={clearAll} className="px-2 text-[0.82rem] font-semibold text-brass hover:underline">
        Clear all
      </button>
    </motion.div>
  )
}

export default function ProductsPage() {
  const { slug } = useParams()
  const { state, update, clearAll, toQuery, activeCount } = useListingFilters()
  const { data: category, isError: categoryMissing } = useCategory(slug)
  const { data: tree } = useCategories()
  const filters = useProductFilters(slug)
  const products = useProducts(toQuery(slug))
  const sheetOpen = useAppSelector((s) => s.ui.filterSheetOpen)
  const dispatch = useAppDispatch()
  const [draft, setDraft] = useState<FilterState>(state)

  useEffect(() => {
    if (sheetOpen) setDraft(state)
  }, [sheetOpen, state])

  useEffect(() => {
    document.title = `${category?.name ?? (state.search ? `Search: ${state.search}` : 'All lighting')} · Unique Lights`
  }, [category?.name, state.search])

  const title = slug ? category?.name : state.search ? `Results for “${state.search}”` : state.isNew ? 'New arrivals' : state.featured ? 'Bestsellers' : 'All lighting'
  const description = slug ? category?.description : 'Pendants, chandeliers, wall lights and lamps for every room.'
  const data = products.data
  const siblings = slug ? (tree?.find((c) => c.slug === slug || c.children.some((ch) => ch.slug === slug))?.children ?? []) : (tree ?? [])

  if (slug && categoryMissing) {
    return (
      <EmptyState
        className="py-28"
        icon={<SearchX size={30} />}
        title="We could not find that category"
        description="It may have been renamed. Browse all lighting instead."
        action={
          <Link to="/products" className="font-semibold text-brass">
            See all lighting
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        {category?.imageUrl && (
          <motion.img
            src={category.imageUrl}
            alt=""
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/40" />
        <div className="container-page relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-4 flex gap-2 text-[0.8rem] text-subtle">
            <Link to="/" className="hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-ink">
              Shop
            </Link>
            {category && (
              <>
                <span>/</span>
                <span className="text-muted">{category.name}</span>
              </>
            )}
          </nav>
          {title ? (
            <motion.h1 key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="text-[clamp(2.2rem,5vw,4rem)]">
              {title}
            </motion.h1>
          ) : (
            <Skeleton className="h-14 w-72" />
          )}
          {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
          {siblings.length > 0 && (
            <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4">
              {siblings.map((c) => (
                <Link key={c.id} to={`/categories/${c.slug}`} className="shrink-0 rounded-full border border-line bg-surface/60 px-4 py-2 text-[0.85rem] text-muted transition-colors hover:border-brass hover:text-ink">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-2">
              <p className="font-display text-[1.3rem]">Filters</p>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="text-[0.82rem] text-brass hover:underline">
                  Reset
                </button>
              )}
            </div>
            <FilterPanel value={state} onChange={(p) => update(p)} options={filters.data} loading={filters.isPending} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.9rem] text-muted" aria-live="polite">
              {data ? (
                <>
                  <span className="font-mono text-ink tabular">{data.totalCount}</span> {data.totalCount === 1 ? 'light' : 'lights'}
                </>
              ) : (
                'Loading…'
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => dispatch(setFilterSheetOpen(true))}>
                <SlidersHorizontal size={15} /> Filters
                {activeCount > 0 && <span className="rounded-full bg-brass px-1.5 font-mono text-[0.68rem] text-on-brass">{activeCount}</span>}
              </Button>
              <label className="sr-only" htmlFor="sort">
                Sort by
              </label>
              <select
                id="sort"
                value={state.sort}
                onChange={(e) => update({ sort: e.target.value as ProductSort })}
                className="h-9 cursor-pointer rounded-full border border-line bg-surface px-4 text-[0.85rem] text-ink outline-none transition-colors hover:border-line-strong focus:border-brass"
              >
                {Object.entries(SORT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <ActiveChips state={state} update={update} clearAll={clearAll} />
          </div>

          <div className={cn('transition-opacity duration-200', products.isPlaceholderData && 'opacity-60')}>
            {products.isPending ? (
              <ProductGridSkeleton count={9} />
            ) : products.isError ? (
              <ErrorState error={products.error} onRetry={() => void products.refetch()} />
            ) : data && data.items.length === 0 ? (
              <EmptyState
                icon={<SearchX size={30} />}
                title="No lights match these filters"
                description="Try removing a filter or searching for something broader."
                action={
                  <Button variant="outline" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : data ? (
              <ProductGrid products={data.items} columns="wide" />
            ) : null}
          </div>

          {data && (
            <Pagination
              className="mt-14"
              page={data.page}
              totalPages={data.totalPages}
              onChange={(page) => {
                update({ page }, { resetPage: false })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => dispatch(setFilterSheetOpen(false))}
        title="Filters"
        footer={
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Button
              variant="ghost"
              onClick={() =>
                setDraft({ ...draft, brands: [], finishes: [], colorTemperatures: [], minPrice: undefined, maxPrice: undefined, inStock: false, isNew: false, featured: false })
              }
            >
              Reset
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                const { page: _page, ...rest } = draft
                void _page
                update(rest)
                dispatch(setFilterSheetOpen(false))
              }}
            >
              Show results
            </Button>
          </div>
        }
      >
        <FilterPanel value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} options={filters.data} loading={filters.isPending} />
      </BottomSheet>
    </div>
  )
}
