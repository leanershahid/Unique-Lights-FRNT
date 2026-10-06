import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductQuery, ProductSort } from '@/types/api'

/**
 * Listing filters live in the URL (shareable, back-button friendly), not in Redux.
 */
export interface FilterState {
  search: string
  minPrice?: number
  maxPrice?: number
  brands: string[]
  finishes: string[]
  colorTemperatures: string[]
  inStock: boolean
  featured: boolean
  isNew: boolean
  sort: ProductSort
  page: number
}

const SORTS: ProductSort[] = ['featured', 'newest', 'price_asc', 'price_desc', 'rating', 'name']
const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])
const num = (v: string | null) => (v !== null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined)

export const PAGE_SIZE = 12

export function useListingFilters() {
  const [params, setParams] = useSearchParams()

  const state: FilterState = useMemo(() => {
    const sort = params.get('sort') as ProductSort | null
    return {
      search: params.get('search') ?? '',
      minPrice: num(params.get('minPrice')),
      maxPrice: num(params.get('maxPrice')),
      brands: list(params.get('brands')),
      finishes: list(params.get('finishes')),
      colorTemperatures: list(params.get('colorTemperatures')),
      inStock: params.get('inStock') === 'true',
      featured: params.get('featured') === 'true',
      isNew: params.get('isNew') === 'true',
      sort: sort && SORTS.includes(sort) ? sort : 'featured',
      page: Math.max(1, num(params.get('page')) ?? 1),
    }
  }, [params])

  const update = useCallback(
    (patch: Partial<FilterState>, opts: { resetPage?: boolean } = { resetPage: true }) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || value === false || (Array.isArray(value) && value.length === 0)) next.delete(key)
            else next.set(key, Array.isArray(value) ? value.join(',') : String(value))
          }
          if (next.get('sort') === 'featured') next.delete('sort')
          if (opts.resetPage && !('page' in patch)) next.delete('page')
          if (next.get('page') === '1') next.delete('page')
          return next
        },
        { preventScrollReset: true },
      )
    },
    [setParams],
  )

  const clearAll = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams()
      const search = prev.get('search')
      if (search) next.set('search', search)
      return next
    })
  }, [setParams])

  const toQuery = useCallback(
    (category?: string): ProductQuery => ({
      search: state.search || undefined,
      category,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      brands: state.brands,
      finishes: state.finishes,
      colorTemperatures: state.colorTemperatures,
      inStock: state.inStock || undefined,
      featured: state.featured || undefined,
      isNew: state.isNew || undefined,
      sort: state.sort,
      page: state.page,
      pageSize: PAGE_SIZE,
    }),
    [state],
  )

  const activeCount =
    state.brands.length + state.finishes.length + state.colorTemperatures.length + (state.minPrice !== undefined || state.maxPrice !== undefined ? 1 : 0) + (state.inStock ? 1 : 0) + (state.featured ? 1 : 0) + (state.isNew ? 1 : 0)

  return { state, update, clearAll, toQuery, activeCount }
}
