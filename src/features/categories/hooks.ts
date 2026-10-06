import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/api/categoryApi'
import { queryKeys } from '@/api/queryKeys'
import type { CategoryDto } from '@/types/api'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: categoryApi.tree,
    staleTime: 10 * 60_000,
  })
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ''),
    queryFn: () => categoryApi.bySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 10 * 60_000,
  })
}

/** Flattens the category tree (parents first). */
export function flattenCategories(tree: CategoryDto[] | undefined): CategoryDto[] {
  if (!tree) return []
  return tree.flatMap((c) => [c, ...flattenCategories(c.children)])
}
