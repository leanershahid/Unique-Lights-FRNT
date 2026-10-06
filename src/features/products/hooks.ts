import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productApi, reviewApi } from '@/api/productApi'
import { queryKeys } from '@/api/queryKeys'
import { useToast } from '@/hooks/useToast'
import type { CreateReviewRequest, PageQuery, ProductQuery } from '@/types/api'

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productApi.list(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug ?? ''),
    queryFn: () => productApi.bySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function useRelatedProducts(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.related(slug ?? ''),
    queryFn: () => productApi.related(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  })
}

export function useProductFilters(category?: string) {
  return useQuery({
    queryKey: queryKeys.products.filters(category),
    queryFn: () => productApi.filters(category),
    staleTime: 5 * 60_000,
  })
}

export function useSearchSuggestions(term: string) {
  const q = term.trim()
  return useQuery({
    queryKey: queryKeys.products.suggest(q.toLowerCase()),
    queryFn: ({ signal }) => productApi.suggest(q, signal),
    enabled: q.length >= 2,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useReviews(productId: string | undefined, query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId ?? '', query),
    queryFn: () => reviewApi.list(productId!, query),
    enabled: Boolean(productId),
    placeholderData: keepPreviousData,
  })
}

export function useReviewSummary(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId ?? ''),
    queryFn: () => reviewApi.summary(productId!),
    enabled: Boolean(productId),
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => reviewApi.create(body),
    onSuccess: (review) => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviews.all(review.productId) })
      void qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success({ title: 'Thanks for your review', description: 'It is now visible on the product page.' })
    },
  })
}

export function useDeleteReview(productId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: string) => reviewApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviews.all(productId) })
      void qc.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.info({ title: 'Review removed' })
    },
    onError: (e) => toast.fromError(e, 'Could not remove review'),
  })
}
